# Guia de Instalação no Unraid com PostgreSQL - Gestock

Este guia explica como instalar o **Gestock** no Unraid utilizando a imagem oficial gerada pelo GitHub Container Registry (`ghcr.io/barroso88/gestock:latest`) ligada à sua base de dados **PostgreSQL** (gerida no pgAdmin).

---

## 1. Mapeamento de Volumes, Portas e Variáveis

| Parâmetro | Valor / Caminho | Descrição |
| :--- | :--- | :--- |
| **Imagem Docker** | `ghcr.io/barroso88/gestock:latest` | Imagem oficial gerada pelo GitHub Actions |
| **Porta Web (Host:Container)** | `3000:3000` | Acesso web ao Gestock (ex: `http://IP_DO_UNRAID:3000`) |
| **Volume de Fotos** | `/mnt/user/appdata/gestock` : `/app/data` | Persistência das fotos carregadas dos produtos (`/app/data/uploads`) |
| **Variável `DATABASE_URL`** | `postgresql://USER:PASSWORD@IP_UNRAID:5432/gestock?schema=public` | String de conexão à sua base de dados PostgreSQL |

---

## 2. Passo a Passo no Unraid (Interface Gráfica)

1. No Unraid, aceda ao separador **Docker** e clique no fundo em **Add Container** ("Adicionar Container").
2. Preencha os seguintes campos:
   - **Name**: `gestock`
   - **Repository**: `ghcr.io/barroso88/gestock:latest`
   - **Icon URL**: `https://raw.githubusercontent.com/Barroso88/gestock/main/public/icon.png`
   - **WebUI**: `http://[IP]:[PORT:3000]`
3. Adicionar **Porta**:
   - Clique em **+ Add another Path, Port, Variable, Device or Label**
   - Config Type: `Port`
   - Name: `Porta Web`
   - Container Port: `3000`
   - Host Port: `3000` (ou outra livre, ex: `3005`)
   - Clique em **Add**
4. Adicionar **Volume de Fotos (Persistência)**:
   - Clique em **+ Add another Path, Port, Variable, Device or Label**
   - Config Type: `Path`
   - Name: `Armazenamento de Fotos`
   - Container Path: `/app/data`
   - Host Path: `/mnt/user/appdata/gestock`
   - Access Mode: `Read/Write`
   - Clique em **Add**
5. Adicionar **Variável de Conexão PostgreSQL (Obrigatório)**:
   - Clique em **+ Add another Path, Port, Variable, Device or Label**
   - Config Type: `Variable`
   - Name: `DATABASE_URL`
   - Key: `DATABASE_URL`
   - Value: `postgresql://UTILIZADOR:PASSWORD@IP_DO_UNRAID:5432/NOME_DA_BD?schema=public`
     *(Substitua com o utilizador, password e nome da base de dados que criou no pgAdmin)*
   - Clique em **Add**
6. *(Opcional)* Adicionar Variáveis para Login Google:
   - `GOOGLE_CLIENT_ID`: seu Client ID
   - `GOOGLE_CLIENT_SECRET`: seu Client Secret
   - `NEXT_PUBLIC_APP_URL`: ex: `http://192.168.1.67:3000`
7. Clique em **Apply** ("Aplicar"). O Unraid irá puxar a imagem e arrancar o container.
   * O container liga-se automaticamente à base de dados PostgreSQL e cria todas as tabelas na primeira execução!
   * Pode abrir o seu **pgAdmin** e verificar imediatamente todas as tabelas criadas no schema `public`.
