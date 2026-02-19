def dots_to_braille(dots):
    """
    点字の番号リスト（例: [2, 3, 5]）を受け取り、
    対応する点字文字とUnicodeコードポイントを返す関数
    """
    # 点字のベースとなるUnicode (空白の点字)
    base_code = 0x2800
    
    offset = 0
    for dot in dots:
        # 入力が1~8の範囲かチェック
        if 1 <= dot <= 8:
            # ビットシフトで値を計算
            # 1の点=2^0, 2の点=2^1, ... という仕組み
            offset |= (1 << (dot - 1))
    
    final_code = base_code + offset
    
    # 文字そのものと、"U+28xx" 形式の文字列を返す
    return chr(final_code), f"U+{final_code:04X}"

# --- 実行例 ---
print(dots_to_braille([3,4,5,6]))  # ('⠑', 'U+2811'
