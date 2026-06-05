# 📊 Dashboard Big Data PKL 65

Platform terintegrasi untuk manajemen dan analisis big data dengan 8 modul yang scalable dan modular.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ (LTS recommended)
- npm, yarn, atau pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/ssabila/pkl-65-dashboard.git
cd pkl-65-dashboard

# Install dependencies
pnpm install
# atau
npm install

# Setup environment
cp .env.example .env.local

# Start development server
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

##  Struktur Folder Dashboard Big Data PKL 65

### **app/** - Next.js App Directory
Menggunakan Next.js 14+ App Router untuk routing berbasis file.

```
app/
├── layout.js                    # Root layout - metadata, fonts, providers
├── page.js                      # Landing page (/route root)
├── globals.css                  # Global styles & design tokens
└── modules/                     # Routing untuk setiap modul
    ├── module-1/
    │   ├── layout.js           # Layout spesifik module-1 (opsional)
    │   └── page.js             # Halaman utama module-1
    └── module-8/
        └── page.js             # Halaman utama module-8
```

**Key files:**
- `layout.js` - Import fonts, setup providers, metadata
- `globals.css` - Design tokens, color palette, typography
- `page.js` - Landing page dengan grid 8 modul

---


### **public/** - Static Files
Semua assets yang tidak berubah.

```
public/
├── fonts/
│   ├── Garet-Bold.woff2       # Font Heading
├── module-1/                  # Asset yang diperlukan oleh module 1
└── module-2/                  # Asset yang diperlukan oleh module 2
```

**Catatan:**
- Font harus di-upload ke `public/fonts/`
- Import fonts di `app/layout.js` menggunakan `next/font/local`

---


## Path Aliases

Untuk import yang lebih clean, gunakan path aliases di `jsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["./components/*"],
      "@lib/*": ["./lib/*"],
      "@public/*": ["./public/*"]
    }
  }
}
```
---
## Tech Stack

- **Frontend Framework:** Next.js 14+
- **Styling:** Tailwind CSS + Custom CSS
- **Typography:** 
  - Heading: Garet Bold (700)
  - Sub-heading: Lora Italic (400)
  - Body: DM Sans (400, 500)
- **Routing:** Next.js App Router (file-based)
- **Language:** JavaScript (ES2020+)

---

## Workflow

### 1. Setup Environment
```bash
# Install dependencies
pnpm install

# Create .env.local
cp .env.example .env.local
```

### 2. Start Development
```bash
# Start dev server on http://localhost:3000
pnpm dev
```

### 3. Create Feature Branch
```bash
# Create branch untuk feature baru
git checkout -b feature/modul-1/data-table

# Atau untuk bug fix
git checkout -b fix/modul-2/styling-issue
```

### 4. Develop & Test
```bash
# Develop your feature
# Test di http://localhost:3000

# Commit changes
git add .
git commit -m "feat(modul-1): add data table with sorting"

# Push to remote
git push origin feature/modul-1/data-table
```

### 5. Create Pull Request
- Go to GitHub repository
- Create Pull Request
- Wait for review
- Merge to main

---