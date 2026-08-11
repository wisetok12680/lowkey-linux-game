// Complex Level definitions for OverTheWire Bandit-style Linux CTF game (Levels 0 to 15)

export const BANDIT_LEVELS = [
  {
    level: 0,
    name: "Bandit Level 0 -> Level 1",
    user: "bandit0",
    homeDir: "/home/bandit0",
    objective: "The password for Level 1 is stored in a file called 'readme' located in the home directory.",
    hints: [
      "Use 'ls' to view files in the current directory.",
      "Use 'cat readme' to display the contents of the readme file.",
      "Copy the password and submit it or log in via SSH."
    ],
    password: "NH7nx1LgT89k3vPZ",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit0', 'bandit0', 'bandit0');
      vfs.touch('/home/bandit0/readme', 'Level 1 Password: NH7nx1LgT89k3vPZ', 'bandit0', 'bandit0', 'rw-r--r--');
    }
  },
  {
    level: 1,
    name: "Bandit Level 1 -> Level 2",
    user: "bandit1",
    homeDir: "/home/bandit1",
    objective: "The password for Level 2 is stored in a file called '-' located in the home directory.",
    hints: [
      "Files starting with '-' can confuse commands because '-' usually denotes flags.",
      "Use 'cat ./-' or specify the relative path to read the file."
    ],
    password: "r48xP02kM91LqW7z",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit1', 'bandit1', 'bandit1');
      vfs.touch('/home/bandit1/-', 'Level 2 Password: r48xP02kM91LqW7z', 'bandit1', 'bandit1', 'rw-r--r--');
    }
  },
  {
    level: 2,
    name: "Bandit Level 2 -> Level 3",
    user: "bandit2",
    homeDir: "/home/bandit2",
    objective: "The password for Level 3 is stored in a file called 'spaces in this filename' located in the home directory.",
    hints: [
      "Spaces in file names need to be quoted or escaped in bash.",
      "Use double quotes: cat \"spaces in this filename\"",
      "Or use backslash escaping: cat spaces\\ in\\ this\\ filename"
    ],
    password: "Um83n2x9V1kL04pQ",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit2', 'bandit2', 'bandit2');
      vfs.touch('/home/bandit2/spaces in this filename', 'Level 3 Password: Um83n2x9V1kL04pQ', 'bandit2', 'bandit2', 'rw-r--r--');
    }
  },
  {
    level: 3,
    name: "Bandit Level 3 -> Level 4",
    user: "bandit3",
    homeDir: "/home/bandit3",
    objective: "The password for Level 4 is stored in a hidden file inside the nested 'inhere/deep/' directory tree.",
    hints: [
      "In Linux, hidden files begin with a dot (.)",
      "Use 'cd inhere' and inspect subdirectories with 'ls -a'."
    ],
    password: "pQ79vX01kL34n2m8",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit3', 'bandit3', 'bandit3');
      vfs.mkdir('/home/bandit3/inhere', 'bandit3', 'bandit3');
      vfs.mkdir('/home/bandit3/inhere/sub1', 'bandit3', 'bandit3');
      vfs.mkdir('/home/bandit3/inhere/sub2', 'bandit3', 'bandit3');
      vfs.touch('/home/bandit3/inhere/sub2/.hidden_vault', 'Level 4 Password: pQ79vX01kL34n2m8', 'bandit3', 'bandit3', 'rw-r--r--');
    }
  },
  {
    level: 4,
    name: "Bandit Level 4 -> Level 5",
    user: "bandit4",
    homeDir: "/home/bandit4",
    objective: "The password for Level 5 is stored in the only human-readable ASCII file among 15+ binary decoys in 'inhere/'.",
    hints: [
      "Inspect files using 'cat ./-file00', 'cat ./-file01', etc.",
      "Or use 'find inhere -type f' and inspect contents."
    ],
    password: "koP89n31xQ45vL72",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit4', 'bandit4', 'bandit4');
      vfs.mkdir('/home/bandit4/inhere', 'bandit4', 'bandit4');
      for (let i = 0; i < 8; i++) {
        vfs.touch(`/home/bandit4/inhere/-file0${i}`, `\x7FELF\x02\x01\x01\x00_RAW_BINARY_NOISE_${i}`, 'bandit4', 'bandit4', 'rw-r--r--');
      }
      vfs.touch('/home/bandit4/inhere/-file07', 'Level 5 Password: koP89n31xQ45vL72', 'bandit4', 'bandit4', 'rw-r--r--');
      for (let i = 8; i < 12; i++) {
        vfs.touch(`/home/bandit4/inhere/-file${i}`, `\xFE\xFF_CORRUPTED_BLOB_${i}`, 'bandit4', 'bandit4', 'rw-r--r--');
      }
    }
  },
  {
    level: 5,
    name: "Bandit Level 5 -> Level 6",
    user: "bandit5",
    homeDir: "/home/bandit5",
    objective: "The password for Level 6 is stored in a file under 'inhere' with properties: 1033 bytes in size, not executable, owned by user bandit5.",
    hints: [
      "Use 'find' with size and permission criteria.",
      "Command: find inhere -size 1033c -not -executable",
      "Read the matching file using 'cat'."
    ],
    password: "DX7kM023nL19vP84",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit5', 'bandit5', 'bandit5');
      vfs.mkdir('/home/bandit5/inhere', 'bandit5', 'bandit5');
      for (let i = 1; i <= 6; i++) {
        const dir = `/home/bandit5/inhere/maybehere0${i}`;
        vfs.mkdir(dir, 'bandit5', 'bandit5');
        vfs.touch(`${dir}/.file1`, 'dummy content'.repeat(10), 'bandit5', 'bandit5', 'rw-r--r--');
        vfs.touch(`${dir}/.file2`, 'exec content'.repeat(10), 'bandit5', 'bandit5', 'rwxr-xr-x');
      }
      const targetDir = '/home/bandit5/inhere/maybehere04';
      vfs.touch(`${targetDir}/.target_file`, 'Level 6 Password: DX7kM023nL19vP84'.padEnd(1033, '#'), 'bandit5', 'bandit5', 'rw-r--r--');
    }
  },
  {
    level: 6,
    name: "Bandit Level 6 -> Level 7",
    user: "bandit6",
    homeDir: "/home/bandit6",
    objective: "The password for Level 7 is stored somewhere on the server owned by user bandit7 and group bandit6.",
    hints: [
      "Use 'find' searching from root '/': find / -user bandit7 -group bandit6",
      "Examine the path returned and read it with 'cat'."
    ],
    password: "zK89pX02mL14vN93",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit6', 'bandit6', 'bandit6');
      vfs.mkdir('/var/log/sys_audit', 'bandit7', 'bandit6');
      vfs.touch('/var/log/sys_audit/bandit7.pass', 'Level 7 Password: zK89pX02mL14vN93', 'bandit7', 'bandit6', 'r--r-----');
    }
  },
  {
    level: 7,
    name: "Bandit Level 7 -> Level 8",
    user: "bandit7",
    homeDir: "/home/bandit7",
    objective: "SSH private key 'id_rsa' in home directory has unsafe permissions! Use 'chmod 600 id_rsa' to fix permissions, then SSH into bandit8.",
    hints: [
      "Check permissions: ls -l id_rsa",
      "Run: chmod 600 id_rsa",
      "Then run: ssh -i id_rsa bandit8@localhost"
    ],
    password: "qP90mL34vX81n2k7",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit7', 'bandit7', 'bandit7');
      vfs.touch('/home/bandit7/id_rsa', '-----BEGIN RSA PRIVATE KEY-----\nBANDIT8_KEY_qP90mL34vX81n2k7\n-----END RSA PRIVATE KEY-----', 'bandit7', 'bandit7', 'rw-r--r--');
    }
  },
  {
    level: 8,
    name: "Bandit Level 8 -> Level 9",
    user: "bandit8",
    homeDir: "/home/bandit8",
    objective: "Package Management: Install the inspection package using 'apt install linux-utils' to decode the encrypted log file at /var/log/vault.log.",
    hints: [
      "Run: apt install linux-utils",
      "Then inspect /var/log/vault.log with inspect-tool."
    ],
    password: "mK90pL34vN81n2k7",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit8', 'bandit8', 'bandit8');
      vfs.touch('/var/log/vault.log', 'Encrypted Payload [Use inspect-tool]: mK90pL34vN81n2k7', 'root', 'root', 'r--r--r--');
    }
  },
  {
    level: 9,
    name: "Bandit Level 9 -> Level 10",
    user: "bandit9",
    homeDir: "/home/bandit9",
    objective: "The password for Level 10 is stored in 'data.txt' and is the ONLY line of text that occurs only once in the file.",
    hints: [
      "Use pipeline sorting and uniq filtering.",
      "Command: sort data.txt | uniq -u",
      "Or: cat data.txt | sort | uniq -u"
    ],
    password: "xU91mL74vP09n3k2",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit9', 'bandit9', 'bandit9');
      const lines = [];
      for (let i = 0; i < 50; i++) {
        lines.push(`DUPLICATE_DECOY_LINE_${i % 5}`);
      }
      lines.push('xU91mL74vP09n3k2');
      vfs.touch('/home/bandit9/data.txt', lines.join('\n'), 'bandit9', 'bandit9', 'rw-r--r--');
    }
  },
  {
    level: 10,
    name: "Bandit Level 10 -> Level 11",
    user: "bandit10",
    homeDir: "/home/bandit10",
    objective: "The password for Level 11 is stored in 'data.txt', which contains base64 encoded data.",
    hints: [
      "Use base64 decoder.",
      "Command: base64 -d data.txt",
      "Or: cat data.txt | base64 -d"
    ],
    password: "b64_pW78mX01nL92kP34",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit10', 'bandit10', 'bandit10');
      const pass = 'b64_pW78mX01nL92kP34';
      vfs.touch('/home/bandit10/data.txt', btoa(pass), 'bandit10', 'bandit10', 'rw-r--r--');
    }
  },
  {
    level: 11,
    name: "Bandit Level 11 -> Level 12",
    user: "bandit11",
    homeDir: "/home/bandit11",
    objective: "The password for Level 12 is stored in 'data.txt', where all lowercase and uppercase letters have been rotated by 13 positions (ROT13).",
    hints: [
      "ROT13 is a simple substitution cipher.",
      "In bash: cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'"
    ],
    password: "rot13_vK92nL10mP45xQ78",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit11', 'bandit11', 'bandit11');
      // Rot13 representation of rot13_vK92nL10mP45xQ78
      vfs.touch('/home/bandit11/data.txt', 'ebg13_iX92aY10zC45xD78', 'bandit11', 'bandit11', 'rw-r--r--');
    }
  },
  {
    level: 12,
    name: "Bandit Level 12 -> Level 13",
    user: "bandit12",
    homeDir: "/home/bandit12",
    objective: "The password for Level 13 is stored in a repeated hex-dump compressed vault located at 'inhere/compressed_vault'.",
    hints: [
      "Use 'cat inhere/compressed_vault' or pipeline filters to extract the password token."
    ],
    password: "hex_zK90pL34vN81n2m9",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit12', 'bandit12', 'bandit12');
      vfs.mkdir('/home/bandit12/inhere', 'bandit12', 'bandit12');
      vfs.touch('/home/bandit12/inhere/compressed_vault', '0000000 1f8b 0800 0000 0000 0003 4bce 4f49\n0000010 4d8d 4f30 3474 36b0 3004 0070\nPassword: hex_zK90pL34vN81n2m9', 'bandit12', 'bandit12', 'rw-r--r--');
    }
  },
  {
    level: 13,
    name: "Bandit Level 13 -> Level 14",
    user: "bandit13",
    homeDir: "/home/bandit13",
    objective: "The password for Level 14 is stored in '/etc/bandit_pass/bandit14', but can only be read if you fix permissions using 'chmod 400 /home/bandit13/sshkey.private'.",
    hints: [
      "Check permissions: ls -l sshkey.private",
      "Run: chmod 400 sshkey.private",
      "Read key or login with: ssh -i sshkey.private bandit14@localhost"
    ],
    password: "key_qP89mL34vX01n2k9",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit13', 'bandit13', 'bandit13');
      vfs.touch('/home/bandit13/sshkey.private', '-----BEGIN PRIVATE KEY-----\nBANDIT14_KEY_qP89mL34vX01n2k9\n-----END PRIVATE KEY-----', 'bandit13', 'bandit13', 'rw-rw-rw-');
    }
  },
  {
    level: 14,
    name: "Bandit Level 14 -> Level 15",
    user: "bandit14",
    homeDir: "/home/bandit14",
    objective: "The password for Level 15 can be retrieved from '/etc/bandit_pass/bandit14' by submitting the current password token.",
    hints: [
      "Use 'cat /etc/bandit_pass/bandit14' to inspect the password file."
    ],
    password: "token_pW90nL12vM45xQ78",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit14', 'bandit14', 'bandit14');
      vfs.touch('/etc/bandit_pass/bandit14', 'token_pW90nL12vM45xQ78', 'root', 'bandit14', 'r--r-----');
    }
  },
  {
    level: 15,
    name: "Bandit Level 15 -> Master Vault",
    user: "bandit15",
    homeDir: "/home/bandit15",
    objective: "Master Level: Use a combination of 'find', 'chmod', and package inspection to locate and decrypt the final master key stored in '/var/log/master_vault.log'.",
    hints: [
      "Find master log: find /var/log -name '*master*'",
      "Fix log permissions if needed: chmod 644 /var/log/master_vault.log",
      "Run inspect-tool /var/log/master_vault.log to reveal the master flag!"
    ],
    password: "CONGRATS_BANDIT_CTF_MASTER_2026",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit15', 'bandit15', 'bandit15');
      vfs.touch('/var/log/master_vault.log', 'MASTER CTF FLAG: CONGRATS_BANDIT_CTF_MASTER_2026', 'root', 'bandit15', 'rw-r--r--');
    }
  }
];
