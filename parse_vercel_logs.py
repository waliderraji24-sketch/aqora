import sys, json
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        o = json.loads(line)
    except json.JSONDecodeError:
        continue
    if isinstance(o, dict):
        if 'message' in o:
            print(o['message'])
        elif 'error' in o:
            print(o['error'])
        elif 'msg' in o:
            print(o['msg'])
