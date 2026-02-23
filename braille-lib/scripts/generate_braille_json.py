# generate_braille_json.py
import yaml
import json

def dots_to_unicode(dots_list):
    """dots: ['1','2'] → Unicode Braille (U+2800 + bitmask)"""
    bitmask = 0
    dot_map = {'1': 1, '2': 2, '3': 4, '4': 8, '5': 16, '6': 32}
    for d in dots_list:
        if '-' in d:  # "1-2" みたいな場合も対応
            for dd in d.split('-'):
                bitmask |= dot_map.get(dd.strip(), 0)
        else:
            bitmask |= dot_map.get(d, 0)
    return chr(0x2800 + bitmask)

with open('braille-mapping.yaml', 'r', encoding='utf-8') as f:
    data = yaml.safe_load(f)

processed_entries = []
for entry in data['entries']:
    if 'dots' in entry:
        braille_char = dots_to_unicode(entry['dots'])
        entry['braille'] = braille_char  # 上書き
        entry['unicode'] = f"U+{ord(braille_char):04X}"
    processed_entries.append(entry)

output = {'entries': processed_entries, 'settings': data.get('settings', {})}

with open('braille-mapping.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("JSON生成完了！")