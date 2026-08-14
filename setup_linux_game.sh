#!/usr/bin/env bash
set -euo pipefail

# Linux From Zero - SSH game bootstrap
# Run as root on the GAME SERVER VM.
# This creates 3 teams x 16 level accounts.
# NOTE: passwords are intentionally the same across teams for this prototype.

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo bash $0"
  exit 1
fi

SERVER_IP="${SERVER_IP:-$(hostname -I | awk '{print $1}')}"
BASE="/opt/linux-from-zero"
GAME_GROUP="linuxgame"

TEAMS=("cyberninjas" "ninjawarriors" "americanninja")

PASSWORDS=(
  "NH7nx1LgT89k3vPZ"
  "r48xP02kM91LqW7z"
  "Um83n2x9V1kL04pQ"
  "pQ79vX01kL34n2m8"
  "koP89n31xQ45vL72"
  "DX7kM023nL19vP84"
  "zK89pX02mL14vN93"
  "qP90mL34vX81n2k7"
  "mK90pL34vN81n2k7"
  "xU91mL74vP09n3k2"
  "b64_pW78mX01nL92kP34"
  "rot13_vK92nL10mP45xQ78"
  "hex_zK90pL34vN81n2m9"
  "key_qP89mL34vX01n2k9"
  "token_pW90nL12vM45xQ78"
  "CONGRATS_LINUX_MASTER_2026"
)

echo "[1/8] Installing required packages..."
apt-get update -y
apt-get install -y openssh-server file xxd python3

systemctl enable --now ssh

echo "[2/8] Creating game group..."
getent group "$GAME_GROUP" >/dev/null || groupadd "$GAME_GROUP"
mkdir -p "$BASE"
chmod 755 "$BASE"

create_user() {
  local user="$1"
  local pass="$2"

  if ! id "$user" >/dev/null 2>&1; then
    useradd -m -s /bin/bash "$user"
  fi

  usermod -s /bin/bash "$user"
  usermod -a -G "$GAME_GROUP" "$user"
  echo "${user}:${pass}" | chpasswd
  chage -M 99999 -m 0 -I -1 -E -1 "$user"
  chmod 700 "/home/${user}"
  # Explicitly ensure game users are NOT sudoers.
  gpasswd -d "$user" sudo >/dev/null 2>&1 || true
}

echo "[3/8] Creating team level accounts..."
for team in "${TEAMS[@]}"; do
  for level in {0..15}; do
    create_user "${team}${level}" "${PASSWORDS[$level]}"
  done
done

echo "[4/8] Building challenge files..."

# Helper: make a level user's file and own it.
put_file() {
  local path="$1"
  local owner="$2"
  local content="$3"
  mkdir -p "$(dirname "$path")"
  printf '%s\n' "$content" > "$path"
  chown "$owner:$owner" "$path"
}

for team in "${TEAMS[@]}"; do
  u0="${team}0"; u1="${team}1"; u2="${team}2"; u3="${team}3"
  u4="${team}4"; u5="${team}5"; u6="${team}6"; u7="${team}7"
  u8="${team}8"; u9="${team}9"; u10="${team}10"; u11="${team}11"
  u12="${team}12"; u13="${team}13"; u14="${team}14"; u15="${team}15"

  # Level 0: readme
  put_file "/home/$u0/readme" "$u0" "${PASSWORDS[1]}"

  # Level 1: filename "-"
  put_file "/home/$u1/-" "$u1" "${PASSWORDS[2]}"

  # Level 2: spaces in filename
  put_file "/home/$u2/spaces in this filename" "$u2" "${PASSWORDS[3]}"

  # Level 3: hidden file in subdirectories
  mkdir -p "/home/$u3/inhere/sub2"
  put_file "/home/$u3/inhere/sub2/.hidden_vault" "$u3" "${PASSWORDS[4]}"

  # Level 4: human-readable file among binary decoys
  mkdir -p "/home/$u4/inhere"
  for n in {01..10}; do
    head -c 128 /dev/urandom > "/home/$u4/inhere/-file$n"
    chown "$u4:$u4" "/home/$u4/inhere/-file$n"
  done
  put_file "/home/$u4/inhere/-file07" "$u4" "${PASSWORDS[5]}"
  chmod 644 "/home/$u4/inhere/"-file*

  # Level 5: exact size, non-executable
  mkdir -p "/home/$u5/inhere/maybehere04"
  printf '%s' "${PASSWORDS[6]}" > "/home/$u5/inhere/maybehere04/.target_file"
  truncate -s 1033 "/home/$u5/inhere/maybehere04/.target_file"
  chown "$u5:$u5" "/home/$u5/inhere/maybehere04/.target_file"
  chmod 644 "/home/$u5/inhere/maybehere04/.target_file"

  # Level 6: system-wide owner/group search
  mkdir -p "/var/log/sys_audit"
  put_file "/var/log/sys_audit/${team}_user7.pass" "$u7" "${PASSWORDS[7]}"
  chgrp "$u6" "/var/log/sys_audit/${team}_user7.pass"
  chmod 644 "/var/log/sys_audit/${team}_user7.pass"

  # Level 7 -> 8: actual SSH key
  mkdir -p "/home/$u8/.ssh"
  chmod 700 "/home/$u8/.ssh"
  chown -R "$u8:$u8" "/home/$u8/.ssh"

  if [[ ! -f "/home/$u7/id_rsa" ]]; then
    runuser -u "$u7" -- ssh-keygen -q -t ed25519 -N "" -f "/home/$u7/id_rsa" >/dev/null
  fi

  cat "/home/$u7/id_rsa.pub" >> "/home/$u8/.ssh/authorized_keys"
  chown "$u8:$u8" "/home/$u8/.ssh/authorized_keys"
  chmod 600 "/home/$u8/.ssh/authorized_keys"

  # Level 8: vault log. inspect-tool is installed globally below.
  put_file "/var/log/vault.log" root "${PASSWORDS[9]}"
  chmod 644 "/var/log/vault.log"

  # Level 9: duplicates + one unique line
  {
    for n in {1..500}; do
      printf 'common_line_%02d\n' $((n % 20))
    done
    printf '%s\n' "${PASSWORDS[10]}"
  } > "/home/$u9/data.txt"
  chown "$u9:$u9" "/home/$u9/data.txt"

  # Level 10: base64
  printf '%s' "${PASSWORDS[11]}" | base64 > "/home/$u10/data.txt"
  chown "$u10:$u10" "/home/$u10/data.txt"

  # Level 11: ROT13
  printf '%s' "${PASSWORDS[12]}" | tr 'A-Za-z' 'N-ZA-Mn-za-m' > "/home/$u11/data.txt"
  chown "$u11:$u11" "/home/$u11/data.txt"

  # Level 12: multi-layer compressed archive, then hex dump.
  work="/tmp/${team}_lvl12"
  rm -rf "$work"
  mkdir -p "$work"
  printf '%s\n' "${PASSWORDS[13]}" > "$work/flag.txt"
  tar -czf "$work/inner.tar.gz" -C "$work" flag.txt
  bzip2 -f "$work/inner.tar.gz"
  mv "$work/inner.tar.gz.bz2" "$work/payload.bz2"
  mkdir -p "/home/$u12/inhere"
  xxd -p "$work/payload.bz2" > "/home/$u12/inhere/compressed_vault"
  chown "$u12:$u12" "/home/$u12/inhere/compressed_vault"
  rm -rf "$work"

  # Level 13 -> 14: actual private key
  mkdir -p "/home/$u14/.ssh"
  chmod 700 "/home/$u14/.ssh"
  chown "$u14:$u14" "/home/$u14/.ssh"
  if [[ ! -f "/home/$u13/sshkey.private" ]]; then
    runuser -u "$u13" -- ssh-keygen -q -t ed25519 -N "" -f "/home/$u13/sshkey.private" >/dev/null
  fi
  cat "/home/$u13/sshkey.private.pub" >> "/home/$u14/.ssh/authorized_keys"
  chown "$u14:$u14" "/home/$u14/.ssh/authorized_keys"
  chmod 600 "/home/$u14/.ssh/authorized_keys"

  # Level 14: system token
  mkdir -p /etc/sys_pass
  put_file "/etc/sys_pass/${team}_user14" root "${PASSWORDS[15]}"
  chmod 644 "/etc/sys_pass/${team}_user14"

  # Level 15 uses a shared master log below.
done

echo "[5/8] Installing inspect-tool..."
cat > /usr/local/bin/inspect-tool <<'EOF'
#!/usr/bin/env bash
set -e
if [[ $# -ne 1 ]]; then
  echo "Usage: inspect-tool <file>"
  exit 1
fi
if [[ ! -f "$1" ]]; then
  echo "inspect-tool: file not found: $1"
  exit 1
fi
cat "$1"
EOF
chmod 755 /usr/local/bin/inspect-tool

echo "[6/8] Creating shared master vault..."
cat > /var/log/master_vault.log <<EOF
MASTER_VAULT
ENCODED_FLAG=$(printf '%s' "${PASSWORDS[15]}" | base64)
EOF
chmod 644 /var/log/master_vault.log
chown root:root /var/log/master_vault.log

echo "[7/8] Tightening permissions..."
for team in "${TEAMS[@]}"; do
  for level in {0..15}; do
    chmod 700 "/home/${team}${level}"
  done
  # Intentionally wrong permissions: the challenge requires the player to fix them.
  chmod 644 "/home/${team}7/id_rsa" || true
  chmod 644 "/home/${team}13/sshkey.private" || true
done

# Allow each level user to SSH to the server normally.
# Do not grant sudo.
systemctl restart ssh

echo "[8/8] Done."
echo
echo "Server IP: $SERVER_IP"
echo
echo "Teams:"
for team in "${TEAMS[@]}"; do
  echo "  $team"
  echo "    Start: ssh ${team}0@$SERVER_IP"
done
echo
echo "Level 0 password for all teams: ${PASSWORDS[0]}"
echo
echo "IMPORTANT:"
echo "  - This prototype uses the same level passwords across teams."
echo "  - Level 8's inspect-tool is preinstalled because game users do not have sudo."
echo "  - Do not expose this prototype to the public Internet yet."
