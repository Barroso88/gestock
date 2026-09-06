# Guia de Instalação no Unraid - Gestock

Este guia explica como instalar o **Gestock** no Unraid utilizando a imagem oficial gerada pelo GitHub Container Registry (`ghcr.io/barroso88/gestock:latest`).

---

## 1. Mapeamento de Volumes e Portas

| Parâmetro | Valor / Caminho | Descrição |
| :--- | :--- | :--- |
| **Imagem Docker** | `ghcr.io/barroso88/gestock:latest` | Imagem gerada automaticamente pelo GitHub |
| **Porta (Host:Container)** | `3000:3000` | Acesso web ao Gestock (ex: `http://IP_DO_UNRAID:3000`) |
| **Volume de Dados** | `/mnt/user/appdata/gestock` : `/app/data` | Persistência da base de dados SQLite (`gestock.db`) e fotos carregadas (`uploads/`) |

---

## 2. Método 1: Adicionar Container pelo Unraid (Interface Gráfica)

1. No Unraid, vá ao separador **Docker** e clique no fundo da página em **Add Container** ("Adicionar Container").
2. Preencha os seguintes campos:
   - **Name**: `gestock`
   - **Repository**: `ghcr.io/barroso88/gestock:latest`
   - **Icon URL**: `https://raw.githubusercontent.com/Barroso88/gestock/main/public/icon.png` (ou deixar em branco)
   - **WebUI**: `http://[IP]:[PORT:3000]`
3. Adicionar **Porta**:
   - Clique em **+ Add another Path, Port, Variable, Device or Label**
   - Config Type: `Port`
   - Name: `Porta Web`
   - Container Port: `3000`
   - Host Port: `3000` (ou outra livre no Unraid, ex: `3005`)
4. Adicionar **Caminho / Volume (Storage Persistente)**:
   - Clique em **+ Add another Path, Port, Variable, Device or Label**
   - Config Type: `Path`
   - Name: `Appdata Storage`
   - Container Path: `/app/data`
   - Host Path: `/mnt/user/appdata/gestock`
5. Adicionar **Variáveis de Ambiente (Opcional)**:
   - Se quiser autenticação Google:
     - `GOOGLE_CLIENT_ID`: seu Client ID do Google Cloud Console
     - `GOOGLE_CLIENT_SECRET`: seu Client Secret do Google Cloud Console
     - `NEXT_PUBLIC_APP_URL`: URL de acesso (ex: `http://192.168.1.50:3000`)
6. Clique em **Apply** ("Aplicar"). O Unraid fará o download da imagem e iniciará o container automaticamente.

---

## 3. Método 2: Via Docker Compose (Plugin Compose Manager no Unraid)

Se utilizar o plugin **Docker Compose Manager** no Unraid, crie uma stack com:

```yaml
version: '3.8'

services:
  gestock:
    image: ghcr.io/barroso88/gestock:latest
    container_name: gestock
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/gestock.db
      - NEXT_PUBLIC_APP_URL=http://[IP_DO_UNRAID]:3000
      # Opcional para login Google:
      # - GOOGLE_CLIENT_ID=
      # - GOOGLE_CLIENT_SECRET=
    volumes:
      - /mnt/user/appdata/gestock:/app/data
```

---

## 4. Atualizações Automáticas

Sempre que fizer um commit/push na branch `main` do repositório GitHub, a GitHub Action compila uma nova imagem e envia para `ghcr.io/barroso88/gestock:latest`.

No Unraid:
- Pode atualizar clicando em **Check for Updates** no separador Docker ou usar o plugin **Watchtower** / **Docker Auto Update**.
- Como todos os dados e imagens estão em `/mnt/user/appdata/gestock`, atualizar o container nunca apaga produtos nem dados existentes!
