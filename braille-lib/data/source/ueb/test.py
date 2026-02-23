import keyboard

# ドットの割り当て (s=3, d=2, f=1, j=4, k=5, l=6)
key_map = {'f': 1, 'd': 2, 's': 4, 'j': 8, 'k': 16, 'l': 32}
currently_pressed = set()
chord_record = set()

def on_key_event(e):
    global currently_pressed, chord_record
    key = e.name.lower()

    if key in key_map:
        if e.event_type == keyboard.KEY_DOWN:
            currently_pressed.add(key)
            chord_record.add(key)
        
        elif e.event_type == keyboard.KEY_UP:
            if key in currently_pressed:
                currently_pressed.remove(key)
            
            # 全てのキーが離されたら出力
            if len(currently_pressed) == 0 and len(chord_record) > 0:
                braille_offset = sum(key_map[k] for k in chord_record)
                braille_char = chr(0x2800 + braille_offset)
                
                # 点字を文字として送信
                keyboard.write(braille_char)
                chord_record.clear()
        
        return False # 元の fdsjkl の入力をブロックする

    return True # 他のキーは通常通り通す

# フックを開始
keyboard.hook(on_key_event, suppress=True)
print("パーキンスブレイラー モード起動中... (終了するには Ctrl+C)")
keyboard.wait()