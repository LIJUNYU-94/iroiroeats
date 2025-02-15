# 空白行を削除するPythonスクリプト
def remove_blank_lines(input_file, output_file):
    with open(input_file, "r", encoding="utf-8") as infile:
        lines = infile.readlines()

    # 空白行を除外して書き込み
    with open(output_file, "w", encoding="utf-8") as outfile:
        outfile.writelines(line for line in lines if line.strip())

# 使い方
input_file = "input.txt"  # 元のファイル
output_file = "output.txt"  # 空白行を削除した新しいファイル
remove_blank_lines(input_file, output_file)

print(f"処理完了！新しいファイル: {output_file}")
