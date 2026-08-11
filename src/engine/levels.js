// Level definitions for OverTheWire Bandit-style Linux game

export const BANDIT_LEVELS = [
  {
    level: 0,
    name: "Bandit Level 0 -> Level 1",
    user: "bandit0",
    homeDir: "/home/bandit0",
    objective: "The password for the next level is stored in a file called 'readme' located in the home directory.",
    hints: [
      "Use 'ls' to view files in the current directory.",
      "Use 'cat readme' to display the contents of the readme file.",
      "Once you find the password, copy it and use 'ssh bandit1@localhost' or submit it."
    ],
    password: "NH7nx1LgT89k3vPZ",
    initialTree: (vfs) => {
      // Bandit 0 home directory setup
      const b0 = vfs.getNode('/home/bandit0');
      if (b0) {
        b0.children = {
          'readme': {
            name: 'readme',
            type: 'file',
            owner: 'bandit0',
            group: 'bandit0',
            permissions: 'rw-r--r--',
            size: 33,
            mtime: 'Aug 11 12:00',
            content: 'Level 1 Password: NH7nx1LgT89k3vPZ'
          }
        };
      }
    }
  },
  {
    level: 1,
    name: "Bandit Level 1 -> Level 2",
    user: "bandit1",
    homeDir: "/home/bandit1",
    objective: "The password for the next level is stored in a file called '-' located in the home directory.",
    hints: [
      "Files starting with '-' can confuse commands because '-' usually denotes command flags.",
      "Use 'cat ./-' or specify the relative path to read the file."
    ],
    password: "r48xP02kM91LqW7z",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit1', 'bandit1', 'bandit1');
      const b1 = vfs.getNode('/home/bandit1');
      if (b1) {
        b1.owner = 'bandit1';
        b1.group = 'bandit1';
        b1.children = {
          '-': {
            name: '-',
            type: 'file',
            owner: 'bandit1',
            group: 'bandit1',
            permissions: 'rw-r--r--',
            size: 28,
            mtime: 'Aug 11 12:05',
            content: 'Level 2 Password: r48xP02kM91LqW7z'
          }
        };
      }
    }
  },
  {
    level: 2,
    name: "Bandit Level 2 -> Level 3",
    user: "bandit2",
    homeDir: "/home/bandit2",
    objective: "The password for the next level is stored in a file called 'spaces in this filename' located in the home directory.",
    hints: [
      "Spaces in file names need to be quoted or escaped in bash.",
      "Use double quotes: cat \"spaces in this filename\"",
      "Or use backslash escaping: cat spaces\\ in\\ this\\ filename"
    ],
    password: "Um83n2x9V1kL04pQ",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit2', 'bandit2', 'bandit2');
      const b2 = vfs.getNode('/home/bandit2');
      if (b2) {
        b2.owner = 'bandit2';
        b2.group = 'bandit2';
        b2.children = {
          'spaces in this filename': {
            name: 'spaces in this filename',
            type: 'file',
            owner: 'bandit2',
            group: 'bandit2',
            permissions: 'rw-r--r--',
            size: 32,
            mtime: 'Aug 11 12:10',
            content: 'Level 3 Password: Um83n2x9V1kL04pQ'
          }
        };
      }
    }
  },
  {
    level: 3,
    name: "Bandit Level 3 -> Level 4",
    user: "bandit3",
    homeDir: "/home/bandit3",
    objective: "The password for the next level is stored in a hidden file in the 'inhere' directory.",
    hints: [
      "In Linux, hidden files begin with a dot (.)",
      "Use 'cd inhere' to enter the directory.",
      "Use 'ls -a' or 'ls -la' to view hidden files.",
      "Read the file with 'cat .hidden' or similar."
    ],
    password: "pQ79vX01kL34n2m8",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit3', 'bandit3', 'bandit3');
      vfs.mkdir('/home/bandit3/inhere', 'bandit3', 'bandit3');
      const inhere = vfs.getNode('/home/bandit3/inhere');
      if (inhere) {
        inhere.children = {
          '.hidden': {
            name: '.hidden',
            type: 'file',
            owner: 'bandit3',
            group: 'bandit3',
            permissions: 'rw-r--r--',
            size: 30,
            mtime: 'Aug 11 12:15',
            content: 'Level 4 Password: pQ79vX01kL34n2m8'
          }
        };
      }
    }
  },
  {
    level: 4,
    name: "Bandit Level 4 -> Level 5",
    user: "bandit4",
    homeDir: "/home/bandit4",
    objective: "The password for the next level is stored in the only human-readable file in the 'inhere' directory.",
    hints: [
      "Navigate to 'inhere' directory.",
      "Inspect files using 'cat ./-file00', 'cat ./-file01', etc.",
      "Or use 'find inhere -type f' and test which one contains ASCII text."
    ],
    password: "koP89n31xQ45vL72",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit4', 'bandit4', 'bandit4');
      vfs.mkdir('/home/bandit4/inhere', 'bandit4', 'bandit4');
      const inhere = vfs.getNode('/home/bandit4/inhere');
      if (inhere) {
        inhere.children = {
          '-file00': { name: '-file00', type: 'file', owner: 'bandit4', group: 'bandit4', permissions: 'rw-r--r--', size: 30, mtime: 'Aug 11 12:20', content: '\xFF\x00\x02BINARY_DATA_BLOB' },
          '-file01': { name: '-file01', type: 'file', owner: 'bandit4', group: 'bandit4', permissions: 'rw-r--r--', size: 30, mtime: 'Aug 11 12:20', content: '\xFE\x01\x88RAW_CORRUPTED' },
          '-file02': { name: '-file02', type: 'file', owner: 'bandit4', group: 'bandit4', permissions: 'rw-r--r--', size: 32, mtime: 'Aug 11 12:20', content: 'Level 5 Password: koP89n31xQ45vL72' },
          '-file03': { name: '-file03', type: 'file', owner: 'bandit4', group: 'bandit4', permissions: 'rw-r--r--', size: 30, mtime: 'Aug 11 12:20', content: '\x90\x90NOP_HEADER_DUMP' }
        };
      }
    }
  },
  {
    level: 5,
    name: "Bandit Level 5 -> Level 6",
    user: "bandit5",
    homeDir: "/home/bandit5",
    objective: "The password for the next level is stored in a file under 'inhere' with properties: 1033 bytes in size, not executable, owned by user bandit5.",
    hints: [
      "Use the 'find' command with criteria flags.",
      "Try: find inhere -size 1033c -not -executable",
      "Then read the matching file using 'cat'."
    ],
    password: "DX7kM023nL19vP84",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit5', 'bandit5', 'bandit5');
      vfs.mkdir('/home/bandit5/inhere', 'bandit5', 'bandit5');
      vfs.mkdir('/home/bandit5/inhere/maybehere01', 'bandit5', 'bandit5');
      vfs.mkdir('/home/bandit5/inhere/maybehere02', 'bandit5', 'bandit5');

      const d1 = vfs.getNode('/home/bandit5/inhere/maybehere01');
      if (d1) {
        d1.children = {
          '.file1': { name: '.file1', type: 'file', owner: 'bandit5', group: 'bandit5', permissions: 'rw-r--r--', size: 500, mtime: 'Aug 11 12:25', content: 'dummy' },
          '.file2': { name: '.file2', type: 'file', owner: 'bandit5', group: 'bandit5', permissions: 'rwxr-xr-x', size: 1033, mtime: 'Aug 11 12:25', content: 'executable file' }
        };
      }

      const d2 = vfs.getNode('/home/bandit5/inhere/maybehere02');
      if (d2) {
        d2.children = {
          '.file1': { name: '.file1', type: 'file', owner: 'bandit5', group: 'bandit5', permissions: 'rw-r--r--', size: 1033, mtime: 'Aug 11 12:25', content: 'Level 6 Password: DX7kM023nL19vP84' }
        };
      }
    }
  },
  {
    level: 6,
    name: "Bandit Level 6 -> Level 7",
    user: "bandit6",
    homeDir: "/home/bandit6",
    objective: "The password for the next level is stored somewhere on the server owned by user bandit7 and group bandit6.",
    hints: [
      "Use 'find' searching from root '/': find / -user bandit7 -group bandit6",
      "Examine the path returned and read it with 'cat'."
    ],
    password: "zK89pX02mL14vN93",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit6', 'bandit6', 'bandit6');
      vfs.mkdir('/var/log/bandit', 'bandit7', 'bandit6');
      vfs.touch('/var/log/bandit/bandit7_password.txt', 'Level 7 Password: zK89pX02mL14vN93', 'bandit7', 'bandit6', 'r--r-----');
    }
  },
  {
    level: 7,
    name: "Bandit Level 7 -> Level 8",
    user: "bandit7",
    homeDir: "/home/bandit7",
    objective: "SSH private key 'id_rsa' is in your home directory, but permissions are too open! Fix permissions with 'chmod' so SSH will accept it.",
    hints: [
      "Check current permissions using 'ls -l id_rsa'.",
      "SSH requires private keys to be accessible ONLY by the owner (600 permissions).",
      "Run 'chmod 600 id_rsa' or 'chmod u=rw,go= id_rsa'.",
      "Then run 'ssh -i id_rsa bandit8@localhost' to proceed!"
    ],
    password: "qP90mL34vX81n2k7",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit7', 'bandit7', 'bandit7');
      vfs.touch('/home/bandit7/id_rsa', '-----BEGIN RSA PRIVATE KEY-----\nBANDIT8_KEY_DATA_qP90mL34vX81n2k7\n-----END RSA PRIVATE KEY-----', 'bandit7', 'bandit7', 'rw-r--r--');
    }
  },
  {
    level: 8,
    name: "Bandit Level 8 -> Master",
    user: "bandit8",
    homeDir: "/home/bandit8",
    objective: "Package Management Task: Use package manager ('apt install linux-utils' or 'pacman -S inspect-tool') to decode the encrypted log file at /var/log/vault.log.",
    hints: [
      "Run package manager command: 'apt install linux-utils' or 'pacman -S inspect-tool'.",
      "Once installed, inspect /var/log/vault.log or run 'inspect-tool /var/log/vault.log'."
    ],
    password: "CONGRATS_BANDIT_MASTER_KEY_2026",
    initialTree: (vfs) => {
      vfs.mkdir('/home/bandit8', 'bandit8', 'bandit8');
      vfs.touch('/var/log/vault.log', 'Encrypted Payload [Use inspect-tool]: CONGRATS_BANDIT_MASTER_KEY_2026', 'root', 'root', 'r--r--r--');
    }
  }
];
