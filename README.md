# LOWKEY LINUX — Interactive System Competition

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

An interactive, web-based gamified Linux terminal simulator and system competition. Designed for students and security enthusiasts to learn Linux CLI commands, filesystem navigation, permission escalation, and data pipeline filtering in a safe, client-side sandbox.

---

## 🌟 Key Features

- 🖥️ **Full-Featured Shell Simulator**:
  - Tab autocompletion for commands & file paths.
  - Shell command history stack (`↑` / `↓` arrow keys & `history` command).
  - Pipe operator (`|`) support for text transformation pipelines (`cat file | grep -v 'decoy' | base64 -d`).
  - Native manual reader (`man <command>`).
  - Direct in-terminal flag submission (`submit <password>` or `flag <password>`).
- 🏆 **16 Escalating Competition Stages (Levels 0 to 15)**:
  - From basic file reading to multi-layered pipeline decoding, `find` searches, `chmod`/`chown` permission repairs, SSH key authentication, and package manager payloads.
- 📋 **Copy/Paste Usability**:
  - One-click copy buttons for terminal outputs and file contents.
  - Direct paste support for solution password tokens and SSH prompts.

---

## 📚 Curriculum & Command Coverage

| Category | Supported Commands & Syntax |
| :--- | :--- |
| **Filesystem Navigation** | `ls` (`-a`, `-l`, `-la`), `cd`, `pwd`, `find` (`-name`, `-size`, `-user`, `-group`, `-perm`) |
| **File Operations** | `cat` (supports `-`, `./-`, spaces), `touch`, `mkdir`, `rm` (`-r`), `cp`, `mv` |
| **Text Processing & Pipes** | `grep` (`-v`, `-i`), `base64` (`-d`), `head`, `tail`, `wc` (`-l`), `sort`, `uniq` (`-u`), `\|` |
| **Permissions & Ownership** | `chmod` (numeric `755`/`600` & symbolic `+x`), `chown` (`user:group`) |
| **Package Management** | `apt install`, `pacman -S` |
| **Remote Access** | `ssh [user]@localhost` (`-i identity_file`) |
| **Competition Controls** | `submit <pass>`, `flag <pass>`, `man`, `help`, `history`, `clear`, `exit` |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- `npm` or `yarn`

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/wisetok12680/lowkey-linux-game.git
   cd lowkey-linux-game
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000/`.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🎯 Level Solution Walkthrough (Levels 0 to 15)

<details>
<summary><strong>Click to expand complete level guide</strong></summary>

### Level 0 → Level 1
- **Goal**: Read the password stored in `readme`.
- **Command**: `cat readme`
- **Password**: `NH7nx1LgT89k3vPZ`

### Level 1 → Level 2
- **Goal**: Read file named `-`.
- **Command**: `cat ./-`
- **Password**: `r48xP02kM91LqW7z`

### Level 2 → Level 3
- **Goal**: Read file with spaces in name.
- **Command**: `cat "spaces in this filename"`
- **Password**: `Um83n2x9V1kL04pQ`

### Level 3 → Level 4
- **Goal**: Find hidden file in subdirectories.
- **Command**: `ls -a inhere/sub2` → `cat inhere/sub2/.hidden_vault`
- **Password**: `pQ79vX01kL34n2m8`

### Level 4 → Level 5
- **Goal**: Find human-readable ASCII file among binary decoys.
- **Command**: `cat inhere/-file07`
- **Password**: `koP89n31xQ45vL72`

### Level 5 → Level 6
- **Goal**: Find file with 1033 bytes, non-executable, owned by user `user5`.
- **Command**: `find inhere -size 1033c -not -executable` → `cat inhere/maybehere04/.target_file`
- **Password**: `DX7kM023nL19vP84`

### Level 6 → Level 7
- **Goal**: Search system files owned by user `user7` and group `user6`.
- **Command**: `find / -user user7 -group user6` → `cat /var/log/sys_audit/user7.pass`
- **Password**: `zK89pX02mL14vN93`

### Level 7 → Level 8
- **Goal**: Fix SSH private key permissions (`rw-------`).
- **Command**: `chmod 600 id_rsa` → `ssh -i id_rsa user8@localhost`
- **Password**: `qP90mL34vX81n2k7`

### Level 8 → Level 9
- **Goal**: Package manager inspection.
- **Command**: `apt install linux-utils` → `inspect-tool /var/log/vault.log`
- **Password**: `mK90pL34vN81n2k7`

### Level 9 → Level 10
- **Goal**: Find the only line that occurs once in `data.txt`.
- **Command**: `sort data.txt | uniq -u` or `cat data.txt | sort | uniq -u`
- **Password**: `xU91mL74vP09n3k2`

### Level 10 → Level 11
- **Goal**: Decode base64 payload in `data.txt`.
- **Command**: `base64 -d data.txt` or `cat data.txt | base64 -d`
- **Password**: `b64_pW78mX01nL92kP34`

### Level 11 → Level 12
- **Goal**: Decode ROT13 encrypted text.
- **Command**: `cat data.txt` → ROT13 shift
- **Password**: `rot13_vK92nL10mP45xQ78`

### Level 12 → Level 13
- **Goal**: Extract password from compressed hex-dump file.
- **Command**: `cat inhere/compressed_vault`
- **Password**: `hex_zK90pL34vN81n2m9`

### Level 13 → Level 14
- **Goal**: Fix permissions on private key to retrieve user14 pass.
- **Command**: `chmod 400 sshkey.private` → `ssh -i sshkey.private user14@localhost`
- **Password**: `key_qP89mL34vX01n2k9`

### Level 14 → Level 15
- **Goal**: Read system password token file.
- **Command**: `cat /etc/sys_pass/user14`
- **Password**: `token_pW90nL12vM45xQ78`

### Level 15 → Master Vault
- **Goal**: Locate master log, adjust permissions, and decode master flag.
- **Command**: `find /var/log -name '*master*'` → `inspect-tool /var/log/master_vault.log`
- **Password**: `CONGRATS_LINUX_MASTER_2026`

</details>

---

## 🛠️ Architecture

- **`src/engine/vfs.js`**: Pure JavaScript in-memory POSIX file system supporting node hierarchy, permissions checking, and path resolution.
- **`src/engine/commandProcessor.js`**: Tokenizer, argument parser, and pipeline execution engine supporting shell commands and man page lookup.
- **`src/engine/levels.js`**: Competition level declarations, target criteria, initial VFS state initializers, and hint sequences.
- **`src/components/`**: Modular React UI components built with Tailwind CSS and Lucide React icons.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
