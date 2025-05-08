.PHONY: start dev embed

run:
	fastapi run main.py

dev:
	fastapi dev main.py

embed_pdf:
	python embed.py --format pdf --path ./data

embed_docx:
	python embed.py --format docx --path ./data/data.docx
