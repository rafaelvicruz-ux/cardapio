from transformers import pipeline

# Carrega um modelo de linguagem (pode ser GPT-2 ou outro disponível localmente)
gerador = pipeline("text-generation", model="gpt2")

dias_semana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

def gerar_cardapio(ingredientes):
    cardapio = {}
    for dia in dias_semana:
        prompt = f"Monte um prato criativo para {dia} usando: {', '.join(ingredientes)}."
        resposta = gerador(prompt, max_length=50, num_return_sequences=1)[0]["generated_text"]
        cardapio[dia] = resposta
    return cardapio

def salvar_html(cardapio):
    with open("cardapio.html", "w", encoding="utf-8") as f:
        f.write("<!DOCTYPE html>\n<html lang='pt-BR'>\n<head>\n")
        f.write("<meta charset='UTF-8'>\n<title>Cardápio da Semana</title>\n")
        f.write("<link rel='stylesheet' href='style.css'>\n</head>\n<body>\n")
        f.write("<h1>🍽️ Cardápio da Semana</h1>\n<div class='semana'>\n")
        for dia, prato in cardapio.items():
            f.write(f"<div class='dia'><h2>{dia}</h2><p>{prato}</p></div>\n")
        f.write("</div>\n</body>\n</html>")

if __name__ == "__main__":
    ingredientes = input("Digite os ingredientes disponíveis (separados por vírgula): ").split(",")
    ingredientes = [i.strip().lower() for i in ingredientes]
    cardapio = gerar_cardapio(ingredientes)
    salvar_html(cardapio)
    print("✅ Arquivo 'cardapio.html' gerado! Abra no navegador.")
