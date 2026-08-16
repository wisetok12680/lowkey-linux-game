// Linux Escalation Competition Levels (Levels 0 to 15)

export function getTeamUsername(teamName, level) {
  const clean = (teamName || 'team').toLowerCase().replace(/[^a-z0-9]/g, '');
  const baseName = clean || 'team';
  if (level === 0) return baseName;
  return `${baseName}${level}`;
}

export function getTeamHomeDir(teamName, level) {
  const u = getTeamUsername(teamName, level);
  return `/home/${u}`;
}

export const COMPETITION_LEVELS = [
  {
    level: 0,
    name: "Stage 0 -> Stage 1",
    user: "team",
    homeDir: "/home/team",
    concepts: [
      "Standard Directory Navigation & Inspection",
      "Reading Plaintext Files",
      "Command Output Parsing"
    ],
    module: {
      title: "Module 03: Terminal"
    },
    objective: [
      "Inspect your home directory to locate the file named 'readme'.",
      "Read the contents of the file to discover the secret password.",
      "Submit the discovered password token to advance to Stage 1."
    ],
    hints: [
      "List the files in your current working directory.",
      "Display the text contents of the 'readme' file.",
      "Submit the password token discovered inside the file."
    ],
    password: "NH7nx1LgT89k3vPZ",
    initialTree: (vfs, teamUser = 'team') => {
      const u = teamUser || 'team';
      vfs.mkdir('/home', 'root', 'root');
      vfs.mkdir(`/home/${u}`, u, u);
      vfs.touch(`/home/${u}/readme`, 'Level 1 Password: NH7nx1LgT89k3vPZ', u, u, 'rw-r--r--');
    }
  },
  {
    level: 1,
    name: "Stage 1 -> Stage 2",
    user: "team1",
    homeDir: "/home/team1",
    concepts: [
      "Option Flag vs Filename Disambiguation",
      "Relative Path Resolution ('./')",
      "Shell Argument Parsing Rules"
    ],
    module: {
      title: "Module 04: Filesystem"
    },
    objective: [
      "Locate the file named '-' in your home directory.",
      "Read its contents using a relative path prefix so the leading dash is not interpreted as a command flag.",
      "Submit the password token to advance to Stage 2."
    ],
    hints: [
      "Filenames starting with a dash (-) confuse commands because they look like options.",
      "Use relative path notation starting with current directory reference to read the file."
    ],
    password: "r48xP02kM91LqW7z",
    initialTree: (vfs, teamUser = 'team1') => {
      const u = teamUser || 'team1';
      vfs.mkdir(`/home/${u}`, u, u);
      vfs.touch(`/home/${u}/-`, 'Level 2 Password: r48xP02kM91LqW7z', u, u, 'rw-r--r--');
    }
  },
  {
    level: 2,
    name: "Stage 2 -> Stage 3",
    user: "team2",
    homeDir: "/home/team2",
    concepts: [
      "Whitespace & Argument Tokenization",
      "String Quoting (Single & Double Quotes)",
      "Character Escaping (Backslash '\\')"
    ],
    module: {
      title: "Module 05: File Operations"
    },
    objective: [
      "Locate the file named 'spaces in this filename' inside your home directory.",
      "Access and read this file by properly quoting or escaping the space characters in the path.",
      "Submit the password token to advance to Stage 3."
    ],
    hints: [
      "Shells break arguments on whitespace unless quoted or escaped.",
      "Enclose the filename in quotes or use backslash escaping for space characters."
    ],
    password: "Um83n2x9V1kL04pQ",
    initialTree: (vfs, teamUser = 'team2') => {
      const u = teamUser || 'team2';
      vfs.mkdir(`/home/${u}`, u, u);
      vfs.touch(`/home/${u}/spaces in this filename`, 'Level 3 Password: Um83n2x9V1kL04pQ', u, u, 'rw-r--r--');
    }
  },
  {
    level: 3,
    name: "Stage 3 -> Stage 4",
    user: "team3",
    homeDir: "/home/team3",
    concepts: [
      "Dotfile Conventions in UNIX/Linux",
      "Directory Attribute Flags",
      "Hidden File Visibility"
    ],
    module: {
      title: "Module 04: Filesystem"
    },
    objective: [
      "Explore the 'inhere' directory tree for subdirectories containing hidden files starting with a dot (.).",
      "Enable hidden file visibility in directory listings to locate '.hidden_vault'.",
      "Read the hidden file and submit the password token for Stage 4."
    ],
    hints: [
      "Linux hides files whose names begin with a period (.).",
      "List directory contents with hidden flags enabled to reveal hidden files."
    ],
    password: "pQ79vX01kL34n2m8",
    initialTree: (vfs, teamUser = 'team3') => {
      const u = teamUser || 'team3';
      vfs.mkdir(`/home/${u}`, u, u);
      vfs.mkdir(`/home/${u}/inhere`, u, u);
      vfs.mkdir(`/home/${u}/inhere/sub1`, u, u);
      vfs.mkdir(`/home/${u}/inhere/sub2`, u, u);
      vfs.touch(`/home/${u}/inhere/sub2/.hidden_vault`, 'Level 4 Password: pQ79vX01kL34n2m8', u, u, 'rw-r--r--');
    }
  },
  {
    level: 4,
    name: "Stage 4 -> Stage 5",
    user: "team4",
    homeDir: "/home/team4",
    concepts: [
      "File MIME & Encoding Classification",
      "ASCII Human-Readable vs Raw Binary Noise",
      "Data Stream Inspection"
    ],
    module: {
      title: "Module 05: File Operations"
    },
    objective: [
      "Explore the 'inhere' directory containing multiple data files.",
      "Identify the single human-readable ASCII text file among the raw binary files.",
      "Read the ASCII text file and submit the password token for Stage 5."
    ],
    hints: [
      "Use file type classification utilities to determine ASCII vs binary data.",
      "Inspect file contents to locate the plain text payload."
    ],
    password: "koP89n31xQ45vL72",
    initialTree: (vfs, teamUser = 'team4') => {
      const u = teamUser || 'team4';
      vfs.mkdir(`/home/${u}`, u, u);
      vfs.mkdir(`/home/${u}/inhere`, u, u);
      for (let i = 0; i < 10; i++) {
        const fileName = i < 10 ? `-file0${i}` : `-file${i}`;
        if (i === 7) {
          vfs.touch(`/home/${u}/inhere/-file07`, 'Level 5 Password: koP89n31xQ45vL72', u, u, 'rw-r--r--');
        } else {
          vfs.touch(`/home/${u}/inhere/${fileName}`, `\x7FELF\x02\x01\x01\x00_RAW_BINARY_NOISE_${i}`, u, u, 'rw-r--r--');
        }
      }
    }
  },
  {
    level: 5,
    name: "Stage 5 -> Stage 6",
    user: "team5",
    homeDir: "/home/team5",
    concepts: [
      "Exact Byte-Size File Filtering",
      "File Permission Attributes (Executable vs Non-Executable)",
      "Recursive Filesystem Searching"
    ],
    module: {
      title: "Module 05: File Operations"
    },
    objective: [
      "Search the 'inhere' directory tree for a file that is exactly 1033 bytes in size.",
      "Ensure the target file is non-executable and owned by your stage user.",
      "Read the target file and submit the password token for Stage 6."
    ],
    hints: [
      "Utilize recursive search tools to filter files by exact byte size.",
      "Exclude executable files from your search criteria."
    ],
    password: "DX7kM023nL19vP84",
    initialTree: (vfs, teamUser = 'team5') => {
      const u = teamUser || 'team5';
      vfs.mkdir(`/home/${u}`, u, u);
      vfs.mkdir(`/home/${u}/inhere`, u, u);
      for (let i = 1; i <= 6; i++) {
        const dir = `/home/${u}/inhere/maybehere04`;
        vfs.mkdir(dir, u, u);
        vfs.touch(`${dir}/file1`, 'dummy content '.repeat(15), u, u, 'rw-r--r--');
        vfs.touch(`${dir}/file2`, 'exec content '.repeat(15), u, u, 'rwxr-xr-x');
      }
      const targetDir = `/home/${u}/inhere/maybehere04`;
      const secret = 'DX7kM023nL19vP84\n';
      vfs.touch(`${targetDir}/target_file`, secret + ' '.repeat(1033 - secret.length), u, u, 'rw-r--r--');
    }
  },
  {
    level: 6,
    name: "Stage 6 -> Stage 7",
    user: "team6",
    homeDir: "/home/team6",
    concepts: [
      "Linux Group Ownership & Access Control",
      "System-Wide Filesystem Auditing",
      "Searching Outside Home Directories"
    ],
    module: {
      title: "Module 04: Filesystem"
    },
    objective: [
      "Your home directory is empty. Search the server starting from root '/' for files belonging to your team group.",
      "Filter search results using your exact team group name shown in your prompt.",
      "Inspect the matching audit file in '/var/log/sys_audit/' and submit the password for Stage 7."
    ],
    hints: [
      "Your home directory is empty. Perform a system-wide search from root for your team group.",
      "Inspect the system path returned to read the password token."
    ],
    password: "zK89pX02mL14vN93",
    initialTree: (vfs, teamUser = 'team6') => {
      const u = teamUser || 'team6';
      const nextU = u.replace(/\d+$/, '') + '7';
      vfs.mkdir(`/home/${u}`, u, u);
      vfs.mkdir('/var/log/sys_audit', nextU, u);
      vfs.touch('/var/log/sys_audit/sys_pass.pass', 'Level 7 Password: zK89pX02mL14vN93', nextU, u, 'r--r-----');
    }
  },
  {
    level: 7,
    name: "Stage 7 -> Stage 8",
    user: "team7",
    homeDir: "/home/team7",
    concepts: [
      "Superuser Privilege Elevation (Sudo)",
      "Root File Ownership & Access Restrictions",
      "SSH Private Key Permissions Security (Mode 600)"
    ],
    module: {
      title: "Module 06: Permissions"
    },
    objective: [
      "Check permissions on the root-owned private key 'id_rsa' in your home folder.",
      "Elevate privileges using administrative superuser commands to set read-only permissions for the owner.",
      "Enter your team's game login password when prompted for administrative authentication.",
      "Read 'id_rsa' and submit the password token for Stage 8."
    ],
    hints: [
      "The key file is owned by root. Use superuser privilege elevation to change key permissions.",
      "Enter your actual team password (the password used to log into the website)."
    ],
    password: "qP90mL34vX81n2k7",
    initialTree: (vfs, teamUser = 'team7') => {
      const u = teamUser || 'team7';
      const nextU = u.replace(/\d+$/, '') + '8';
      vfs.mkdir(`/home/${u}`, u, u);
      vfs.touch(`/home/${u}/id_rsa`, `-----BEGIN RSA PRIVATE KEY-----\n${nextU.toUpperCase()}_KEY_qP90mL34vX81n2k7\n-----END RSA PRIVATE KEY-----`, 'root', 'root', '---------');
    }
  },
  {
    level: 8,
    name: "Stage 8 -> Stage 9",
    user: "team8",
    homeDir: "/home/team8",
    concepts: [
      "Package Management & Software Installation",
      "System Utility Installation",
      "Log Inspection Utilities"
    ],
    module: {
      title: "Module 07: Packages"
    },
    objective: [
      "An encrypted log file exists at '/var/log/vault.log'.",
      "Use the package manager to install the 'linux-utils' software package.",
      "Inspect the log file using the installed inspection utility to reveal the Stage 9 password."
    ],
    hints: [
      "Use the package manager command interface to install new utilities.",
      "Run the installed inspection tool against the target log file."
    ],
    password: "mK90pL34vN81n2k7",
    initialTree: (vfs, teamUser = 'team8') => {
      const u = teamUser || 'team8';
      vfs.mkdir(`/home/${u}`, u, u);
      vfs.touch('/var/log/vault.log', '[ENCRYPTED LOG DATA STREAM 0x8F9A42]\n[RAW BINARY NOISE: 4F 6E 63 72 79 70 74 65 64]\n[ENCRYPTED PAYLOAD] Run inspect-tool /var/log/vault.log to decrypt log stream.', 'root', 'root', 'r--r--r--');
    }
  },
  {
    level: 9,
    name: "Stage 9 -> Stage 10",
    user: "team9",
    homeDir: "/home/team9",
    concepts: [
      "Unix Pipeline Redirection ('|')",
      "Text Stream Sorting & Unique Filtering",
      "Duplicate Removal in Large Datasets"
    ],
    module: {
      title: "Module 05: File Operations"
    },
    objective: [
      "Open 'data.txt' in your home directory.",
      "Filter out duplicate lines by sorting text and extracting the single unique line.",
      "Submit the unique line as the Stage 10 password token."
    ],
    hints: [
      "Filter text streams by sorting lines before running unique line analysis.",
      "Configure unique filtering flags to output only lines with a single occurrence."
    ],
    password: "xU91mL74vP09n3k2",
    initialTree: (vfs, teamUser = 'team9') => {
      const u = teamUser || 'team9';
      vfs.mkdir(`/home/${u}`, u, u);
      const lines = [];
      const decoys = [];
      const prefixes = ['alpha', 'beta', 'charlie', 'delta', 'echo', 'x_decoy_node_', 'z_vault_node_', 'zone_decoy_'];
      for (let d = 0; d < 40; d++) {
        const pfix = prefixes[d % prefixes.length];
        const p1 = (d * 73 + 101).toString(36);
        const p2 = (d * 109 + 211).toString(36);
        decoys.push(`${pfix}_${p1}_decoy_${p2}`);
      }
      for (let i = 0; i < 1000; i++) {
        lines.push(decoys[i % decoys.length]);
      }
      lines.splice(432, 0, 'xU91mL74vP09n3k2');
      vfs.touch(`/home/${u}/data.txt`, lines.join('\n'), u, u, 'rw-r--r--');
    }
  },
  {
    level: 10,
    name: "Stage 10 -> Stage 11",
    user: "team10",
    homeDir: "/home/team10",
    concepts: [
      "Base64 Binary-to-Text Encoding Schema",
      "Data Stream Decoding",
      "Plaintext Reconstruction"
    ],
    module: {
      title: "Module 05: File Operations"
    },
    objective: [
      "Open 'data.txt' containing Base64 encoded payload text.",
      "Decode the Base64 stream back into readable plaintext.",
      "Submit the decoded text as the Stage 11 password token."
    ],
    hints: [
      "Base64 represents binary or text payloads using printable ASCII characters.",
      "Pass the data stream through a Base64 decoding tool."
    ],
    password: "b64_pW78mX01nL92kP34",
    initialTree: (vfs, teamUser = 'team10') => {
      const u = teamUser || 'team10';
      vfs.mkdir(`/home/${u}`, u, u);
      const pass = 'b64_pW78mX01nL92kP34';
      vfs.touch('/home/' + u + '/data.txt', btoa(pass), u, u, 'rw-r--r--');
    }
  },
  {
    level: 11,
    name: "Stage 11 -> Stage 12",
    user: "team11",
    homeDir: "/home/team11",
    concepts: [
      "Alphabetical Rotation Ciphers (ROT13)",
      "Character Stream Translation",
      "Substitution Cipher Decryption"
    ],
    module: {
      title: "Module 05: File Operations"
    },
    objective: [
      "Open 'data.txt' containing text rotated by 13 alphabet positions (ROT13).",
      "Translate the ROT13 characters back to original plain text.",
      "Submit the decoded text as the Stage 12 password token."
    ],
    hints: [
      "ROT13 shifts alphabetic characters forward or backward by 13 places.",
      "Use character translation utilities to map input character sets to shifted output sets."
    ],
    password: "rot13_vK92nL10mP45kQ78",
    initialTree: (vfs, teamUser = 'team11') => {
      const u = teamUser || 'team11';
      vfs.mkdir(`/home/${u}`, u, u);
      vfs.touch(`/home/${u}/data.txt`, 'ebg13_iX92aY10zC45xD78', u, u, 'rw-r--r--');
    }
  },
  {
    level: 12,
    name: "Stage 12 -> Stage 13",
    user: "team12",
    homeDir: "/home/team12",
    concepts: [
      "Formatted Hexadecimal Inspection (Hex Dumps)",
      "Compressed Archive Streams",
      "Binary Data Parsing"
    ],
    module: {
      title: "Module 05: File Operations"
    },
    objective: [
      "Inspect the hex-dump archive at 'inhere/compressed_vault'.",
      "Parse the data stream to locate the cleartext password.",
      "Submit the password to advance to Stage 13."
    ],
    hints: [
      "Examine hex output formatting to locate cleartext data segments.",
      "Read the archive contents to discover the password payload."
    ],
    password: "hex_zK90pL34vN81n2m9",
    initialTree: (vfs, teamUser = 'team12') => {
      const u = teamUser || 'team12';
      vfs.mkdir(`/home/${u}`, u, u);
      vfs.mkdir(`/home/${u}/inhere`, u, u);
      vfs.touch(`/home/${u}/inhere/data.dat`, '\x1f\x8b\x08\x00\x00\x00\x00\x00\x02\x03hex_zK90pL34vN81n2m9\x0a\x00_RAW_BINARY_DATA_', u, u, 'rw-r--r--');
    }
  },
  {
    level: 13,
    name: "Stage 13 -> Stage 14",
    user: "team13",
    homeDir: "/home/team13",
    concepts: [
      "Owner Read-Only Security Access Masks (Mode 400)",
      "Private Key Identity Protection",
      "System Credential Restrictions"
    ],
    module: {
      title: "Module 08: SSH"
    },
    objective: [
      "Locate the private SSH identity key file 'sshkey.private' in your home folder.",
      "Restrict key access permissions so only the owner has read access (mode 400 or 600).",
      "Connect via SSH using the identity file flag option to log into target user '<team_name>14@lowkey-linux'.",
      "Navigate to '/etc/credentials/' on the remote host and inspect 'stage14.pass' to reveal the Stage 14 password token."
    ],
    hints: [
      "Private keys must be restricted to mode 400 or 600 before OpenSSH accepts them.",
      "After connecting via SSH, inspect system credential files under /etc/credentials/."
    ],
    password: "ssh_kP90mL34vX81n2m9",
    initialTree: (vfs, teamUser = 'team13') => {
      const u = teamUser || 'team13';
      const nextU = u.replace(/\d+$/, '') + '14';
      vfs.mkdir(`/home/${u}`, u, u);
      vfs.touch(`/home/${u}/sshkey.private`, `-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAABG...${nextU.toUpperCase()}_KEY_SECRET\n-----END OPENSSH PRIVATE KEY-----`, u, u, 'rw-rw-rw-');
      vfs.mkdir('/etc/credentials', 'root', 'root');
      vfs.touch('/etc/credentials/stage14.pass', 'ssh_kP90mL34vX81n2m9', nextU, nextU, 'r--------');
    }
  },
  {
    level: 14,
    name: "Stage 14 -> Stage 15",
    user: "team14",
    homeDir: "/home/team14",
    concepts: [
      "System Configuration Directories ('/etc/')",
      "Protected Password Credential Stores",
      "Multi-User Environment Privilege Hierarchy"
    ],
    module: {
      title: "Module 04: Filesystem"
    },
    objective: [
      "Navigate to system password files under '/etc/sys_pass/'.",
      "Read your team's credential file in '/etc/sys_pass/'.",
      "Submit the password token for the final Master Vault."
    ],
    hints: [
      "Navigate to system configuration directories under '/etc/'.",
      "Read the system password credential file."
    ],
    password: "token_pW90nL12vM45xQ78",
    initialTree: (vfs, teamUser = 'team14') => {
      const u = teamUser || 'team14';
      vfs.mkdir(`/home/${u}`, u, u);
      vfs.touch(`/etc/sys_pass/${u}`, 'token_pW90nL12vM45xQ78', 'root', u, 'r--r-----');
    }
  },
  {
    level: 15,
    name: "Stage 15 -> Final Stage",
    user: "team15",
    homeDir: "/home/team15",
    concepts: [
      "System-Wide Forensic File Discovery ('find')",
      "POSIX Access Control & Masking ('chmod')",
      "Multi-Stage Stream Filtering ('grep' & 'uniq')",
      "Character Rotation & Stream Decoding ('tr' & 'base64')"
    ],
    module: {
      title: "Module 09: Final Challenge"
    },
    objective: [
      "Locate the restricted audit file in '/var/backups/system_audit/' owned by your user group.",
      "Fix file permissions so your user account can read the audit payload.",
      "Filter out duplicate decoy lines, translate the ROT13 cipher stream, and decode the Base64 payload.",
      "Submit the Master Flag to complete the Linux competition!"
    ],
    hints: [
      "Search system backup directories using find with group ownership criteria.",
      "Modify file permissions if access is denied.",
      "Chain text processing commands using pipes (|) to filter noise, translate ROT13 characters, and decode Base64."
    ],
    password: "MASTER_VAULT_FLAG_2026_ULTIMATE_LINUX_HERO",
    initialTree: (vfs, teamUser = 'team15') => {
      const u = teamUser || 'team15';
      vfs.mkdir(`/home/${u}`, u, u);
      vfs.mkdir('/var/backups', 'root', 'root');
      vfs.mkdir('/var/backups/system_audit', 'root', u, 'rwxr-x---');

      const passToken = "MASTER_VAULT_FLAG_2026_ULTIMATE_LINUX_HERO";
      const b64 = btoa(passToken);
      const rot13 = b64.replace(/[a-zA-Z]/g, c => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + 13) % 26) + 65);
        if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + 13) % 26) + 97);
        return c;
      });

      const dataset = [
        "DECOY_AUDIT_LOG_NODE_001_INVALID",
        "DECOY_AUDIT_LOG_NODE_001_INVALID",
        "DECOY_AUDIT_LOG_NODE_002_INVALID",
        "DECOY_AUDIT_LOG_NODE_002_INVALID",
        "DECOY_AUDIT_LOG_NODE_003_INVALID",
        "DECOY_AUDIT_LOG_NODE_003_INVALID",
        rot13
      ].sort().join('\n');

      vfs.touch('/var/backups/system_audit/vault_dump.raw', dataset, 'root', u, '---------');
    }
  }
];
