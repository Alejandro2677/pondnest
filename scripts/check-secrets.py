"""Read-only scan of publication candidates, build output and all reachable Git blobs.
Never prints matching values. This is a targeted scan, not a guarantee against all secrets.
"""
import json, re, subprocess
from pathlib import Path

def git(*args):
    return subprocess.check_output(['git', *args])

known = []
for path in Path('.').glob('.env*'):
    if path.name == '.env.example' or not path.is_file():
        continue
    for line in path.read_text(encoding='utf-8-sig').splitlines():
        match = re.match(r'\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$', line)
        if match and re.search(r'TOKEN|PASSWORD|SECRET|PRIVATE_KEY', match[1]):
            value = match[2].strip('"\'').encode()
            if len(value) >= 12:
                known.append(value)

patterns = [
    ('shopify-token', rb'\bshp(?:at|ca|pa|ss)_[A-Za-z0-9]{20,}\b'),
    ('github-token', rb'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b'),
    ('private-key', rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
    ('aws-access-key', rb'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b'),
]
findings = []
def scan(label, data):
    if b'\0' in data[:8192]:
        return
    for kind, pattern in patterns:
        if re.search(pattern, data):
            findings.append({'location': label, 'kind':kind})
    if any(value in data for value in known):
        findings.append({'location':label,'kind':'matches-local-private-credential'})

candidates = git('ls-files','--cached','--others','--exclude-standard','-z').decode().split('\0')
for name in set(filter(None,candidates)):
    path=Path(name)
    if path.is_file():
        scan(name,path.read_bytes())
for path in Path('dist').rglob('*'):
    if path.is_file():
        scan(str(path),path.read_bytes())
objects=git('rev-list','--objects','--all').decode().splitlines()
blobs=0
batch = subprocess.check_output(['git','cat-file','--batch'],input=('\n'.join(entry.split(' ',1)[0] for entry in objects)+'\n').encode())
offset=0
for entry in objects:
    oid,_,name=entry.partition(' ')
    end=batch.index(b'\n',offset)
    _,kind,size=batch[offset:end].split()
    size=int(size)
    offset=end+1
    if kind==b'blob':
        blobs+=1
        scan('git:'+oid[:12]+':'+name,batch[offset:offset+size])
    offset+=size+1
result={'workingFilesChecked':len(set(filter(None,candidates))),'historicalBlobsChecked':blobs,'knownPrivateCredentialsChecked':len(known),'findings':findings}
print(json.dumps(result,indent=2))
raise SystemExit(bool(findings))
