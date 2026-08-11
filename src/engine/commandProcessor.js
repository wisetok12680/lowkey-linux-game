// Command Processor Engine for Lowkey Linux Simulator

import { BANDIT_LEVELS } from './levels';

export const MAN_PAGES = {
  'ls': `LS(1)                          User Commands                         LS(1)

NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

DESCRIPTION
       List  information  about  the FILEs (the current directory by default).
       Sort entries alphabetically if non-specified.

       -a, --all
              do not ignore entries starting with .

       -l     use a long listing format showing permissions, owner, size, date

       -la, -al
              combination of -l and -a

EXAMPLE
       ls -la /home/bandit0`,

  'cd': `CD(1)                          User Commands                         CD(1)

NAME
       cd - change the shell working directory

SYNOPSIS
       cd [DIRECTORY]

DESCRIPTION
       Change the current working directory to DIRECTORY.
       Default DIRECTORY is the home directory (~).
       Use 'cd -' to switch back to the previous working directory.`,

  'pwd': `PWD(1)                         User Commands                        PWD(1)

NAME
       pwd - print name of current/working directory

SYNOPSIS
       pwd`,

  'cat': `CAT(1)                         User Commands                        CAT(1)

NAME
       cat - concatenate files and print on the standard output

SYNOPSIS
       cat [OPTION]... [FILE]...

DESCRIPTION
       Concatenate FILE(s) to standard output.
       To read files named with leading dashes (-), use cat ./-`,

  'mkdir': `MKDIR(1)                       User Commands                      MKDIR(1)

NAME
       mkdir - make directories

SYNOPSIS
       mkdir [OPTION]... DIRECTORY...`,

  'touch': `TOUCH(1)                       User Commands                      TOUCH(1)

NAME
       touch - change file timestamps or create empty file

SYNOPSIS
       touch FILE...`,

  'rm': `RM(1)                          User Commands                         RM(1)

NAME
       rm - remove files or directories

SYNOPSIS
       rm [OPTION]... [FILE]...

OPTIONS
       -r, -R, --recursive
              remove directories and their contents recursively`,

  'cp': `CP(1)                          User Commands                         CP(1)

NAME
       cp - copy files and directories

SYNOPSIS
       cp [OPTION]... SOURCE DEST`,

  'mv': `MV(1)                          User Commands                         MV(1)

NAME
       mv - move (rename) files

SYNOPSIS
       mv SOURCE DEST`,

  'find': `FIND(1)                        User Commands                       FIND(1)

NAME
       find - search for files in a directory hierarchy

SYNOPSIS
       find [path...] [expression]

EXPRESSIONS
       -name pattern
              Base of file name matches shell pattern.
       -size n[c]
              File uses n units of space (c = bytes).
       -user uname
              File is owned by user uname.
       -group gname
              File belongs to group gname.
       -not -executable
              Match files that are not executable.`,

  'chmod': `CHMOD(1)                       User Commands                      CHMOD(1)

NAME
       chmod - change file mode bits

SYNOPSIS
       chmod [OPTION]... MODE[,MODE]... FILE...

DESCRIPTION
       chmod changes the file mode bits of each given file.
       MODE can be numeric (e.g. 755, 600) or symbolic (e.g. u+x, +x, go=r).`,

  'chown': `CHOWN(1)                       User Commands                      CHOWN(1)

NAME
       chown - change file owner and group

SYNOPSIS
       chown [OPTION]... [OWNER][:[GROUP]] FILE...`,

  'ssh': `SSH(1)                         User Commands                        SSH(1)

NAME
       ssh - OpenSSH remote login client

SYNOPSIS
       ssh [USER@]HOST [-i identity_file]

DESCRIPTION
       ssh connects and logs into the specified host.
       Used in Bandit to progress between levels: ssh bandit1@localhost`,

  'apt': `APT(8)                         APT                                 APT(8)

NAME
       apt - command-line interface for package management

SYNOPSIS
       apt update | apt install PACKAGE`,

  'pacman': `PACMAN(8)                      Pacman Manual                     PACMAN(8)

NAME
       pacman - package manager utility

SYNOPSIS
       pacman -S PACKAGE`,

  'flatpak': `FLATPAK(1)                    Flatpak Manual                    FLATPAK(1)

NAME
       flatpak - Application deployment framework

SYNOPSIS
       flatpak install PACKAGE`,

  'snap': `SNAP(1)                       Snap Manual                       SNAP(1)

NAME
       snap - Tool to interact with snaps

SYNOPSIS
       snap install PACKAGE`
};

export function processCommand(rawInput, state, setState) {
  const input = rawInput.trim();
  if (!input) return null;

  // Add to command history
  const history = [...state.history, input];

  // Tokenize preserving quoted strings
  const tokens = parseCommandLine(input);
  const cmd = tokens[0]?.toLowerCase();
  const args = tokens.slice(1);

  let output = '';
  let newCwd = state.cwd;
  let newPrevCwd = state.prevCwd;
  let currentUser = state.currentUser;
  let currentLevel = state.currentLevel;
  let installedPackages = new Set(state.installedPackages || []);
  let promptSSHModal = false;
  let sshTargetUser = null;

  const vfs = state.vfs;

  switch (cmd) {
    case 'pwd': {
      output = newCwd;
      break;
    }

    case 'clear': {
      setState(prev => ({ ...prev, history, terminalLogs: [] }));
      return null;
    }

    case 'history': {
      output = history.map((line, idx) => `  ${idx + 1}  ${line}`).join('\n');
      break;
    }

    case 'help': {
      output = `Lowkey Linux - Command Reference & Shell Instructions
---------------------------------------------------
File Navigation:  ls, cd, pwd, find
File Operations:  cat, touch, mkdir, rm, cp, mv
Permissions:      chmod, chown
System Tools:     man, help, history, clear, exit
Package Tools:    apt, flatpak, snap, pacman
Remote Access:    ssh [user]@localhost

Tip: Type 'man <command>' for manual pages.
Tip: Type 'ssh banditX@localhost' or submit password to advance level.`;
      break;
    }

    case 'man': {
      if (!args[0]) {
        output = 'What manual page do you want?\nExample: man ls';
      } else {
        const page = MAN_PAGES[args[0].toLowerCase()];
        output = page || `No manual entry for ${args[0]}`;
      }
      break;
    }

    case 'ls': {
      let showAll = false;
      let longFormat = false;
      const targetPaths = [];

      for (const arg of args) {
        if (arg.startsWith('-') && arg !== '-') {
          if (arg.includes('a')) showAll = true;
          if (arg.includes('l')) longFormat = true;
        } else {
          targetPaths.push(arg);
        }
      }

      const targetPath = targetPaths[0] ? vfs.normalizePath(newCwd, targetPaths[0], state.homeDir) : newCwd;
      const node = vfs.getNode(targetPath);

      if (!node) {
        output = `ls: cannot access '${targetPaths[0] || ''}': No such file or directory`;
      } else if (node.type === 'file') {
        output = longFormat ? vfs.formatLongListing(node, node.name) : node.name;
      } else {
        const entries = Object.values(node.children || {});
        const filtered = entries.filter(e => showAll || !e.name.startsWith('.'));

        if (showAll && !filtered.some(e => e.name === '.')) {
          filtered.unshift({ name: '.', type: 'dir', permissions: node.permissions, owner: node.owner, group: node.group, size: 4096, mtime: node.mtime });
          filtered.unshift({ name: '..', type: 'dir', permissions: 'rwxr-xr-x', owner: 'root', group: 'root', size: 4096, mtime: 'Aug 11 12:00' });
        }

        if (longFormat) {
          output = filtered.map(e => vfs.formatLongListing(e, e.name)).join('\n');
        } else {
          output = filtered.map(e => e.name).join('  ');
        }
      }
      break;
    }

    case 'cd': {
      let target = args[0];
      if (!target || target === '~') {
        target = state.homeDir;
      } else if (target === '-') {
        target = newPrevCwd || state.homeDir;
      }

      const resolved = vfs.normalizePath(newCwd, target, state.homeDir);
      const node = vfs.getNode(resolved);

      if (!node) {
        output = `bash: cd: ${args[0]}: No such file or directory`;
      } else if (node.type !== 'dir') {
        output = `bash: cd: ${args[0]}: Not a directory`;
      } else if (!vfs.hasPermission(node, currentUser, 'x')) {
        output = `bash: cd: ${args[0]}: Permission denied`;
      } else {
        newPrevCwd = newCwd;
        newCwd = resolved;
      }
      break;
    }

    case 'cat': {
      if (!args[0]) {
        output = 'cat: missing filename argument\nExample: cat readme';
        break;
      }

      const fileOutputs = [];
      for (let arg of args) {
        let path = arg;
        if (arg === '-') {
          path = vfs.normalizePath(newCwd, '-', state.homeDir);
        } else if (arg === './-') {
          path = vfs.normalizePath(newCwd, '-', state.homeDir);
        } else {
          path = vfs.normalizePath(newCwd, arg, state.homeDir);
        }

        const node = vfs.getNode(path);
        if (!node) {
          fileOutputs.push(`cat: ${arg}: No such file or directory`);
        } else if (node.type === 'dir') {
          fileOutputs.push(`cat: ${arg}: Is a directory`);
        } else if (!vfs.hasPermission(node, currentUser, 'r')) {
          fileOutputs.push(`cat: ${arg}: Permission denied`);
        } else {
          fileOutputs.push(node.content || '');
        }
      }
      output = fileOutputs.join('\n');
      break;
    }

    case 'mkdir': {
      if (!args[0]) {
        output = 'mkdir: missing operand';
      } else {
        for (const arg of args) {
          if (arg.startsWith('-')) continue;
          const target = vfs.normalizePath(newCwd, arg, state.homeDir);
          const res = vfs.mkdir(target, currentUser, currentUser);
          if (!res.success) {
            output += `mkdir: cannot create directory '${arg}': ${res.error}\n`;
          }
        }
        output = output.trim();
      }
      break;
    }

    case 'touch': {
      if (!args[0]) {
        output = 'touch: missing file operand';
      } else {
        for (const arg of args) {
          const target = vfs.normalizePath(newCwd, arg, state.homeDir);
          vfs.touch(target, '', currentUser, currentUser);
        }
      }
      break;
    }

    case 'rm': {
      let recursive = false;
      const files = [];
      for (const arg of args) {
        if (arg === '-r' || arg === '-rf' || arg === '-r-f') recursive = true;
        else if (!arg.startsWith('-')) files.push(arg);
      }

      if (files.length === 0) {
        output = 'rm: missing operand';
      } else {
        for (const f of files) {
          const target = vfs.normalizePath(newCwd, f, state.homeDir);
          const res = vfs.rm(target, recursive);
          if (!res.success) {
            output += `rm: cannot remove '${f}': ${res.error}\n`;
          }
        }
        output = output.trim();
      }
      break;
    }

    case 'cp': {
      let recursive = false;
      const paths = [];
      for (const arg of args) {
        if (arg === '-r' || arg === '-R') recursive = true;
        else if (!arg.startsWith('-')) paths.push(arg);
      }

      if (paths.length < 2) {
        output = 'cp: missing destination file operand after source';
      } else {
        const src = vfs.normalizePath(newCwd, paths[0], state.homeDir);
        const dest = vfs.normalizePath(newCwd, paths[1], state.homeDir);
        const res = vfs.cp(src, dest, recursive);
        if (!res.success) output = `cp: ${res.error}`;
      }
      break;
    }

    case 'mv': {
      if (args.length < 2) {
        output = 'mv: missing destination file operand after source';
      } else {
        const src = vfs.normalizePath(newCwd, args[0], state.homeDir);
        const dest = vfs.normalizePath(newCwd, args[1], state.homeDir);
        const res = vfs.mv(src, dest);
        if (!res.success) output = `mv: ${res.error}`;
      }
      break;
    }

    case 'chmod': {
      if (args.length < 2) {
        output = 'chmod: missing operand\nUsage: chmod 755 file OR chmod +x file';
      } else {
        const mode = args[0];
        const file = args[1];
        const target = vfs.normalizePath(newCwd, file, state.homeDir);
        const node = vfs.getNode(target);
        if (!node) {
          output = `chmod: cannot access '${file}': No such file or directory`;
        } else {
          const res = vfs.chmod(node, mode);
          if (!res.success) output = `chmod: ${res.error}`;
        }
      }
      break;
    }

    case 'chown': {
      if (args.length < 2) {
        output = 'chown: missing operand\nUsage: chown user:group file';
      } else {
        const ownerGroup = args[0];
        const file = args[1];
        const target = vfs.normalizePath(newCwd, file, state.homeDir);
        const node = vfs.getNode(target);
        if (!node) {
          output = `chown: cannot access '${file}': No such file or directory`;
        } else {
          vfs.chown(node, ownerGroup);
        }
      }
      break;
    }

    case 'find': {
      const searchPath = args[0] && !args[0].startsWith('-') ? args[0] : '.';
      const startAbs = vfs.normalizePath(newCwd, searchPath, state.homeDir);

      const criteria = {};
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-name' && args[i + 1]) criteria.name = args[i + 1];
        if (args[i] === '-user' && args[i + 1]) criteria.user = args[i + 1];
        if (args[i] === '-group' && args[i + 1]) criteria.group = args[i + 1];
        if (args[i] === '-size' && args[i + 1]) criteria.size = args[i + 1];
        if (args[i] === '-not' && args[i + 1] === '-executable') criteria.notExecutable = true;
      }

      const res = vfs.find(startAbs, criteria);
      if (!res.success) {
        output = `find: '${searchPath}': ${res.error}`;
      } else {
        output = res.results.join('\n');
      }
      break;
    }

    case 'apt':
    case 'pacman':
    case 'flatpak':
    case 'snap': {
      const pkg = args[1] || args[0];
      installedPackages.add(pkg || 'linux-utils');
      output = `[${cmd.toUpperCase()}] Updating repository index...
[${cmd.toUpperCase()}] Installing package '${pkg || 'linux-utils'}'...
[${cmd.toUpperCase()}] Package installed successfully. Added system binary '/usr/bin/inspect-tool'.`;

      // Add binary to VFS
      vfs.touch('/usr/bin/inspect-tool', 'Binary inspection utility', 'root', 'root', 'rwxr-xr-x');
      break;
    }

    case 'inspect-tool': {
      if (!args[0]) {
        output = 'Usage: inspect-tool /path/to/log';
      } else {
        const target = vfs.normalizePath(newCwd, args[0], state.homeDir);
        const node = vfs.getNode(target);
        if (node && node.content) {
          output = `[DECRYPTED VAULT PAYLOAD]\n${node.content}`;
        } else {
          output = 'inspect-tool: cannot read target log file';
        }
      }
      break;
    }

    case 'ssh': {
      const targetArg = args.find(a => !a.startsWith('-'));
      let identityFile = null;
      const iIdx = args.indexOf('-i');
      if (iIdx !== -1 && args[iIdx + 1]) identityFile = args[iIdx + 1];

      if (!targetArg) {
        output = 'usage: ssh [-i identity_file] user@hostname';
      } else {
        const [targetUser] = targetArg.split('@');
        
        // Level 7 Special check for id_rsa key permissions
        if (currentLevel === 7 && targetUser === 'bandit8') {
          const keyPath = vfs.normalizePath(newCwd, identityFile || 'id_rsa', state.homeDir);
          const keyNode = vfs.getNode(keyPath);

          if (!keyNode) {
            output = `ssh: Could not resolve hostname or file '${identityFile || 'id_rsa'}': No such file`;
            break;
          }

          if (keyNode.permissions !== 'rw-------') {
            output = `@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions ${keyNode.permissions} for '${keyNode.name}' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
Load key "${keyNode.name}": bad permissions
${targetUser}@localhost: Permission denied (publickey).`;
            break;
          }
        }

        promptSSHModal = true;
        sshTargetUser = targetUser;
        output = `Connecting to ${targetUser}@localhost...`;
      }
      break;
    }

    case 'exit': {
      output = 'logout\nConnection to localhost closed.';
      break;
    }

    default: {
      output = `bash: ${cmd}: command not found. Type 'help' for available commands.`;
      break;
    }
  }

  setState(prev => ({
    ...prev,
    cwd: newCwd,
    prevCwd: newPrevCwd,
    currentUser,
    currentLevel,
    history,
    installedPackages,
    terminalLogs: [
      ...prev.terminalLogs,
      { type: 'input', user: currentUser, cwd: state.cwd, text: input },
      ...(output ? [{ type: 'output', text: output }] : [])
    ]
  }));

  return { promptSSHModal, sshTargetUser };
}

// Shell command parser handling quotes and backslashes
function parseCommandLine(cmdStr) {
  const args = [];
  let current = '';
  let inDoubleQuote = false;
  let inSingleQuote = false;
  let escaped = false;

  for (let i = 0; i < cmdStr.length; i++) {
    const char = cmdStr[i];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\' && !inSingleQuote) {
      escaped = true;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (/\s/.test(char) && !inDoubleQuote && !inSingleQuote) {
      if (current.length > 0) {
        args.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    args.push(current);
  }

  return args;
}
