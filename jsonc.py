import json

# JSONファイルを読み込む
with open("data.json", "r", encoding="utf-8") as file:
    data = json.load(file)

# "fooddata" の各項目に "position" を追加
for item in data.get("fooddata", []):
    item["position"] = "ここにデフォルトの値を入力"  # 必要に応じて変更

# 変更をJSONファイルに保存
with open("data.json", "w", encoding="utf-8") as file:
    json.dump(data, file, ensure_ascii=False, indent=4)

print("JSONファイルの更新が完了しました！")
