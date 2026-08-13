// Linux Escalation Competition Levels (Levels 0 to 15)

export const COMPETITION_LEVELS = [
  {
    level: 0,
    name: "Stage 0 -> Stage 1",
    user: "user0",
    homeDir: "/home/user0",
    question: "How do you inspect the contents of a standard file in Linux?",
    objective: "The password for Level 1 is stored in a file called 'readme' located in the home directory.",
    hints: [
      "Use 'ls' to view files in the current directory.",
      "Use 'cat readme' to display the contents of the readme file.",
      "Copy the password and submit it or log in via SSH."
    ],
    password: "NH7nx1LgT89k3vPZ",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user0', 'user0', 'user0');
      vfs.touch('/home/user0/readme', 'Level 1 Password: NH7nx1LgT89k3vPZ', 'user0', 'user0', 'rw-r--r--');
    }
  },
  {
    level: 1,
    name: "Stage 1 -> Stage 2",
    user: "user1",
    homeDir: "/home/user1",
    question: "How do you read a file named '-' without it being parsed as a command option?",
    objective: "The password for Level 2 is stored in a file called '-' located in the home directory.",
    hints: [
      "Files starting with '-' can confuse commands because '-' usually denotes flags.",
      "Use 'cat ./-' or specify the relative path to read the file."
    ],
    password: "r48xP02kM91LqW7z",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user1', 'user1', 'user1');
      vfs.touch('/home/user1/-', 'Level 2 Password: r48xP02kM91LqW7z', 'user1', 'user1', 'rw-r--r--');
    }
  },
  {
    level: 2,
    name: "Stage 2 -> Stage 3",
    user: "user2",
    homeDir: "/home/user2",
    question: "How do you handle file names containing spaces in bash commands?",
    objective: "The password for Level 3 is stored in a file called 'spaces in this filename' located in the home directory.",
    hints: [
      "Spaces in file names need to be quoted or escaped in bash.",
      "Use double quotes: cat \"spaces in this filename\"",
      "Or use backslash escaping: cat spaces\\ in\\ this\\ filename"
    ],
    password: "Um83n2x9V1kL04pQ",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user2', 'user2', 'user2');
      vfs.touch('/home/user2/spaces in this filename', 'Level 3 Password: Um83n2x9V1kL04pQ', 'user2', 'user2', 'rw-r--r--');
    }
  },
  {
    level: 3,
    name: "Stage 3 -> Stage 4",
    user: "user3",
    homeDir: "/home/user3",
    question: "How do you locate and list hidden files starting with a dot (.) in a directory tree?",
    objective: "The password for Level 4 is stored in a hidden file inside the 'inhere' directory tree.",
    hints: [
      "In Linux, hidden files begin with a dot (.)",
      "Use 'cd inhere' and inspect subdirectories with 'ls -a'."
    ],
    password: "pQ79vX01kL34n2m8",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user3', 'user3', 'user3');
      vfs.mkdir('/home/user3/inhere', 'user3', 'user3');
      vfs.mkdir('/home/user3/inhere/sub1', 'user3', 'user3');
      vfs.mkdir('/home/user3/inhere/sub2', 'user3', 'user3');
      vfs.touch('/home/user3/inhere/sub2/.hidden_vault', 'Level 4 Password: pQ79vX01kL34n2m8', 'user3', 'user3', 'rw-r--r--');
    }
  },
  {
    level: 4,
    name: "Stage 4 -> Stage 5",
    user: "user4",
    homeDir: "/home/user4",
    question: "How do you distinguish human-readable ASCII text files from raw binary files?",
    objective: "The password for Level 5 is stored in the only human-readable ASCII file located within the 'inhere' directory.",
    hints: [
      "Inspect files using 'cat ./-file00', 'cat ./-file01', etc.",
      "Or use 'find inhere -type f' and inspect contents."
    ],
    password: "koP89n31xQ45vL72",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user4', 'user4', 'user4');
      vfs.mkdir('/home/user4/inhere', 'user4', 'user4');
      for (let i = 0; i < 8; i++) {
        vfs.touch(`/home/user4/inhere/-file0${i}`, `\x7FELF\x02\x01\x01\x00_RAW_BINARY_NOISE_${i}`, 'user4', 'user4', 'rw-r--r--');
      }
      vfs.touch('/home/user4/inhere/-file07', 'Level 5 Password: koP89n31xQ45vL72', 'user4', 'user4', 'rw-r--r--');
      for (let i = 8; i < 12; i++) {
        vfs.touch(`/home/user4/inhere/-file${i}`, `\xFE\xFF_CORRUPTED_BLOB_${i}`, 'user4', 'user4', 'rw-r--r--');
      }
    }
  },
  {
    level: 5,
    name: "Stage 5 -> Stage 6",
    user: "user5",
    homeDir: "/home/user5",
    question: "How do you search for files matching specific criteria (size, permissions, owner) using 'find'?",
    objective: "The password for Level 6 is stored in a file under 'inhere' with properties: 1033 bytes in size, not executable, owned by user user5.",
    hints: [
      "Use 'find' with size and permission criteria.",
      "Command: find inhere -size 1033c -not -executable",
      "Read the matching file using 'cat'."
    ],
    password: "DX7kM023nL19vP84",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user5', 'user5', 'user5');
      vfs.mkdir('/home/user5/inhere', 'user5', 'user5');
      for (let i = 1; i <= 6; i++) {
        const dir = `/home/user5/inhere/maybehere0${i}`;
        vfs.mkdir(dir, 'user5', 'user5');
        vfs.touch(`${dir}/.file1`, 'dummy content'.repeat(10), 'user5', 'user5', 'rw-r--r--');
        vfs.touch(`${dir}/.file2`, 'exec content'.repeat(10), 'user5', 'user5', 'rwxr-xr-x');
      }
      const targetDir = '/home/user5/inhere/maybehere04';
      vfs.touch(`${targetDir}/.target_file`, 'Level 6 Password: DX7kM023nL19vP84'.padEnd(1033, '#'), 'user5', 'user5', 'rw-r--r--');
    }
  },
  {
    level: 6,
    name: "Stage 6 -> Stage 7",
    user: "user6",
    homeDir: "/home/user6",
    question: "How do you search the entire filesystem for files owned by specific user and group identities?",
    objective: "The password for Level 7 is stored somewhere on the server owned by user user7 and group user6.",
    hints: [
      "Use 'find' searching from root '/': find / -user user7 -group user6",
      "Examine the path returned and read it with 'cat'."
    ],
    password: "zK89pX02mL14vN93",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user6', 'user6', 'user6');
      vfs.mkdir('/var/log/sys_audit', 'user7', 'user6');
      vfs.touch('/var/log/sys_audit/user7.pass', 'Level 7 Password: zK89pX02mL14vN93', 'user7', 'user6', 'r--r-----');
    }
  },
  {
    level: 7,
    name: "Stage 7 -> Stage 8",
    user: "user7",
    homeDir: "/home/user7",
    question: "How do you set appropriate private key permissions ('chmod 600') before SSH authentication?",
    objective: "An SSH private key 'id_rsa' in your home directory has permissions that are too open for authentication.",
    hints: [
      "Check permissions: ls -l id_rsa",
      "Run: chmod 600 id_rsa",
      "Then run: ssh -i id_rsa user8@localhost"
    ],
    password: "qP90mL34vX81n2k7",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user7', 'user7', 'user7');
      vfs.touch('/home/user7/id_rsa', '-----BEGIN RSA PRIVATE KEY-----\nUSER8_KEY_qP90mL34vX81n2k7\n-----END RSA PRIVATE KEY-----', 'user7', 'user7', 'rw-r--r--');
    }
  },
  {
    level: 8,
    name: "Stage 8 -> Stage 9",
    user: "user8",
    homeDir: "/home/user8",
    question: "How do you install software packages using 'apt' to inspect and decode encrypted system logs?",
    objective: "An encrypted log file exists at '/var/log/vault.log'. Use the package manager to install the inspection tool required to read it.",
    hints: [
      "Run: apt install linux-utils",
      "Then inspect /var/log/vault.log with inspect-tool."
    ],
    password: "mK90pL34vN81n2k7",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user8', 'user8', 'user8');
      vfs.touch('/var/log/vault.log', 'Encrypted Payload [Use inspect-tool]: mK90pL34vN81n2k7', 'root', 'root', 'r--r--r--');
    }
  },
  {
    level: 9,
    name: "Stage 9 -> Stage 10",
    user: "user9",
    homeDir: "/home/user9",
    question: "How do you combine 'sort' and 'uniq' in a pipeline to filter out duplicated lines?",
    objective: "The password for Level 10 is stored in 'data.txt' and is the ONLY line of text that occurs only once in the file.",
    hints: [
      "Use pipeline sorting and uniq filtering.",
      "Command: sort data.txt | uniq -u",
      "Or: cat data.txt | sort | uniq -u"
    ],
    password: "xU91mL74vP09n3k2",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user9', 'user9', 'user9');
      const lines = [];
      for (let i = 0; i < 50; i++) {
        lines.push(`DUPLICATE_DECOY_LINE_${i % 5}`);
      }
      lines.push('xU91mL74vP09n3k2');
      vfs.touch('/home/user9/data.txt', lines.join('\n'), 'user9', 'user9', 'rw-r--r--');
    }
  },
  {
    level: 10,
    name: "Stage 10 -> Stage 11",
    user: "user10",
    homeDir: "/home/user10",
    question: "How do you decode Base64 encoded text from a file?",
    objective: "The password for Level 11 is stored in 'data.txt', which contains base64 encoded data.",
    hints: [
      "Use base64 decoder.",
      "Command: base64 -d data.txt",
      "Or: cat data.txt | base64 -d"
    ],
    password: "b64_pW78mX01nL92kP34",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user10', 'user10', 'user10');
      const pass = 'b64_pW78mX01nL92kP34';
      vfs.touch('/home/user10/data.txt', btoa(pass), 'user10', 'user10', 'rw-r--r--');
    }
  },
  {
    level: 11,
    name: "Stage 11 -> Stage 12",
    user: "user11",
    homeDir: "/home/user11",
    question: "How do you decode ROT13 character substitution using 'tr'?",
    objective: "The password for Level 12 is stored in 'data.txt', where all lowercase and uppercase letters have been rotated by 13 positions (ROT13).",
    hints: [
      "ROT13 is a simple substitution cipher.",
      "In bash: cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'"
    ],
    password: "rot13_vK92nL10mP45xQ78",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user11', 'user11', 'user11');
      vfs.touch('/home/user11/data.txt', 'ebg13_iX92aY10zC45xD78', 'user11', 'user11', 'rw-r--r--');
    }
  },
  {
    level: 12,
    name: "Stage 12 -> Stage 13",
    user: "user12",
    homeDir: "/home/user12",
    question: "How do you parse hex dumps and extract compressed data archives?",
    objective: "The password for Level 13 is stored in the hex-dump archive located at 'inhere/compressed_vault'.",
    hints: [
      "Use 'cat inhere/compressed_vault' or pipeline filters to extract the password token."
    ],
    password: "hex_zK90pL34vN81n2m9",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user12', 'user12', 'user12');
      vfs.mkdir('/home/user12/inhere', 'user12', 'user12');
      vfs.touch('/home/user12/inhere/compressed_vault', '0000000 1f8b 0800 0000 0000 0003 4bce 4f49\n0000010 4d8d 4f30 3474 36b0 3004 0070\nPassword: hex_zK90pL34vN81n2m9', 'user12', 'user12', 'rw-r--r--');
    }
  },
  {
    level: 13,
    name: "Stage 13 -> Stage 14",
    user: "user13",
    homeDir: "/home/user13",
    question: "How do you adjust SSH key file permissions ('chmod 400') to read protected credentials?",
    objective: "The password for Level 14 is stored in '/etc/sys_pass/user14', but requires restricting permissions on the private SSH key in your home directory.",
    hints: [
      "Check permissions: ls -l sshkey.private",
      "Run: chmod 400 sshkey.private",
      "Read key or login with: ssh -i sshkey.private user14@localhost"
    ],
    password: "key_qP89mL34vX01n2k9",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user13', 'user13', 'user13');
      vfs.touch('/home/user13/sshkey.private', '-----BEGIN PRIVATE KEY-----\nUSER14_KEY_qP89mL34vX01n2k9\n-----END PRIVATE KEY-----', 'user13', 'user13', 'rw-rw-rw-');
    }
  },
  {
    level: 14,
    name: "Stage 14 -> Stage 15",
    user: "user14",
    homeDir: "/home/user14",
    question: "How do you inspect system password files in '/etc/sys_pass/'?",
    objective: "The password for Level 15 can be retrieved from '/etc/sys_pass/user14' by submitting the current password token.",
    hints: [
      "Use 'cat /etc/sys_pass/user14' to inspect the password file."
    ],
    password: "token_pW90nL12vM45xQ78",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user14', 'user14', 'user14');
      vfs.touch('/etc/sys_pass/user14', 'token_pW90nL12vM45xQ78', 'root', 'user14', 'r--r-----');
    }
  },
  {
    level: 15,
    name: "Stage 15 -> Master Vault",
    user: "user15",
    homeDir: "/home/user15",
    question: "How do you combine Linux diagnostic tools ('find', 'chmod', 'apt', 'inspect-tool') for a final system audit?",
    objective: "Master Level: Locate and decrypt the final master key stored in '/var/log/master_vault.log'.",
    hints: [
      "Find master log: find /var/log -name '*master*'",
      "Fix log permissions if needed: chmod 644 /var/log/master_vault.log",
      "Run inspect-tool /var/log/master_vault.log to reveal the master key!"
    ],
    password: "CONGRATS_LINUX_MASTER_2026",
    initialTree: (vfs) => {
      vfs.mkdir('/home/user15', 'user15', 'user15');
      vfs.touch('/var/log/master_vault.log', 'MASTER KEY: CONGRATS_LINUX_MASTER_2026', 'root', 'user15', 'rw-r--r--');
    }
  }
];
