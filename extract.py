import sys
import zipfile
import re

try:
    with zipfile.ZipFile(sys.argv[1]) as zf:
        content = zf.read('word/document.xml').decode('utf-8')
        text = re.sub(r'<[^>]+>', ' ', content)
        text = re.sub(r'\s+', ' ', text)
        with open('extracted.txt', 'w', encoding='utf-8') as f:
            f.write(text)
except Exception as e:
    with open('extracted.txt', 'w', encoding='utf-8') as f:
        f.write(str(e))
