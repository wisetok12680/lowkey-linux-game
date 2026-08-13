// Advanced Command Processor Engine for Lowkey Linux Simulator

import { COMPETITION_LEVELS } from './levels';

export const MAN_PAGES = {
  'ls': `LS(1)                          User Commands                         LS(1)

NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

DESCRIPTION
       List information about the FILEs (the current directory by default).
       -a, --all        do not ignore entries starting with .
       -l               use a long listing format
       -la, -al         combination of -l and -a`,

  'cd': `CD(1)                          User Commands                         CD(1)

NAME
       cd - change directory

SYNOPSIS
       cd [DIRECTORY]

DESCRIPTION
       Change the current working directory to DIRECTORY.
       Default DIRECTORY is home (~). Use 'cd -' to return to previous directory.`,

  'pwd': `PWD(1)                         User Commands                        PWD(1)

NAME
       pwd - print working directory

SYNOPSIS
       pwd`,

  'cat': `CAT(1)                         User Commands                        CAT(1)

NAME
       cat - concatenate files and print on the standard output

SYNOPSIS
       cat [FILE]...

DESCRIPTION
       Concatenate FILE(s) to standard output.
       For files named with leading dashes (-), use: cat ./-`,

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
       -r, --recursive   remove directories and their contents recursively`,

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
       -name pattern      match file name
       -size n[c]         match file size (c = bytes)
       -user uname        match file owner
       -group gname       match file group owner
       -perm mode         match file permissions
       -not -executable   match non-executable files`,

  'chmod': `CHMOD(1)                       User Commands                      CHMOD(1)

NAME
       chmod - change file mode bits

SYNOPSIS
       chmod [OPTION]... MODE FILE...

DESCRIPTION
       Change permissions using numeric octal (e.g. 755, 600) or symbolic (e.g. u+x, +x).`,

  'chown': `CHOWN(1)                       User Commands                      CHOWN(1)

NAME
       chown - change file owner and group

SYNOPSIS
       chown OWNER[:GROUP] FILE...`,

  'grep': `GREP(1)                        User Commands                       GREP(1)

NAME
       grep - print lines that match patterns

SYNOPSIS
       grep [OPTION]... PATTERN [FILE]...

DESCRIPTION
       Search for PATTERN in each FILE or standard input.
       -v, --invert-match   select non-matching lines
       -i, --ignore-case    ignore case distinctions`,

  'base64': `BASE64(1)                      User Commands                     BASE64(1)

NAME
       base64 - base64 encode/decode data and print to standard output

SYNOPSIS
       base64 [OPTION]... [FILE]

DESCRIPTION
       Base64 encode or decode FILE, or standard input.
       -d, --decode   decode data`,

  'head': `HEAD(1)                        User Commands                       HEAD(1)

NAME
       head - output the first part of files

SYNOPSIS
       head -n NUM [FILE]`,

  'tail': `TAIL(1)                        User Commands                       TAIL(1)

NAME
       tail - output the last part of files

SYNOPSIS
       tail -n NUM [FILE]`,

  'wc': `WC(1)                          User Commands                         WC(1)

NAME
       wc - print newline, word, and byte counts

SYNOPSIS
       wc [OPTION]... [FILE]...
       -l, --lines   print the line counts`,

  'sort': `SORT(1)                        User Commands                       SORT(1)

NAME
       sort - sort lines of text files

SYNOPSIS
       sort [FILE]...`,

  'uniq': `UNIQ(1)                        User Commands                       UNIQ(1)

NAME
       uniq - report or omit repeated lines

SYNOPSIS
       uniq [OPTION]... [INPUT]
       -u, --unique   only print unique lines`,

  'ssh': `SSH(1)                         User Commands                        SSH(1)

NAME
       ssh - OpenSSH remote login client

SYNOPSIS
       ssh [USER@]HOST [-i identity_file]`,

  'apt': `APT(8)                         APT                                 APT(8)

NAME
       apt - command-line interface for package management`,

  'pacman': `PACMAN(8)                      Pacman Manual                     PACMAN(8)

NAME
       pacman - package manager utility`
};

export function processCommand(rawInput, state, setState) {
  const input = rawInput.trim();
  if (!input) return null;

  const history = [...state.history, input];

  // Pipeline execution handling
  if (input.includes('|')) {
    const pipeSegments = input.split('|').map(s => s.trim());
    let currentInputText = '';

    for (let i = 0; i < pipeSegments.length; i++) {
      const seg = pipeSegments[i];
      const res = executeSingleCommand(seg, currentInputText, state, setState, history);
      if (res && res.output !== undefined) {
        currentInputText = res.output;
      }
      if (res && res.promptSSHModal) {
        return res;
      }
    }

    setState(prev => ({
      ...prev,
      history,
      terminalLogs: [
        ...prev.terminalLogs,
        { type: 'input', user: state.currentUser, cwd: state.cwd, text: input },
        ...(currentInputText ? [{ type: 'output', text: currentInputText }] : [])
      ]
    }));
    return null;
  }

  // Single command execution
  const res = executeSingleCommand(input, null, state, setState, history);
  
  if (res && res.skipLogUpdate) return res;

  setState(prev => ({
    ...prev,
    cwd: res.newCwd !== undefined ? res.newCwd : prev.cwd,
    prevCwd: res.newPrevCwd !== undefined ? res.newPrevCwd : prev.prevCwd,
    history,
    terminalLogs: [
      ...prev.terminalLogs,
      { type: 'input', user: state.currentUser, cwd: state.cwd, text: input },
      ...(res.output ? [{ type: 'output', text: res.output }] : [])
    ]
  }));

  return res;
}

function executeSingleCommand(cmdStr, stdinText, state, setState, history) {
  const tokens = parseCommandLine(cmdStr);
  const cmd = tokens[0]?.toLowerCase();
  const args = tokens.slice(1);

  let output = '';
  let newCwd = state.cwd;
  let newPrevCwd = state.prevCwd;
  let currentUser = state.currentUser;
  let currentLevel = state.currentLevel;
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
      return { skipLogUpdate: true };
    }

    case 'history': {
      output = history.map((line, idx) => `  ${idx + 1}  ${line}`).join('\n');
      break;
    }

    case 'submit':
    case 'flag': {
      const submittedPass = args[0]?.trim();
      const currentLevelData = COMPETITION_LEVELS[state.currentLevel];
      if (!submittedPass) {
        output = `Usage: submit <stage_password>\nSubmit the password token discovered in current stage to advance.`;
      } else if (submittedPass === currentLevelData.password) {
        const nextLevel = Math.min(COMPETITION_LEVELS.length - 1, state.currentLevel + 1);
        const nextData = COMPETITION_LEVELS[nextLevel];
        if (nextData && nextData.initialTree) {
          nextData.initialTree(state.vfs);
        }
        setState(prev => ({
          ...prev,
          currentLevel: nextLevel,
          currentUser: nextData.user,
          cwd: nextData.homeDir,
          homeDir: nextData.homeDir,
          terminalLogs: [
            { type: 'output', text: `[SUCCESS] Correct password! Advancing to Stage ${nextLevel}...\nLinux lowkey-linux 5.15.0-generic x86_64\nLogged in as ${nextData.user}@localhost.` }
          ]
        }));
        return { skipLogUpdate: true };
      } else {
        output = `[ERROR] Incorrect password token for Stage ${state.currentLevel}. Try again.`;
      }
      break;
    }

    case 'help': {
      output = `Lowkey Linux Shell - Command Reference
-----------------------------------------
Filesystem & Search:  ls, cd, pwd, find, cat, head, tail, wc, sort, uniq, grep, base64
File Modification:   touch, mkdir, rm, cp, mv, chmod, chown
CTF & Progression:    submit <pass>, flag <pass>, ssh, man, help, history, clear, exit
Package Manager:     apt, pacman

Pipes: Supports '|' command chaining (e.g. cat data.txt | grep -v 'decoy' | base64 -d)`;
      break;
    }

    case 'man': {
      if (!args[0]) {
        output = 'What manual page do you want?\nExample: man find';
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
      if (stdinText !== null && args.length === 0) {
        output = stdinText;
        break;
      }

      if (!args[0]) {
        output = 'cat: missing filename argument';
        break;
      }

      const fileOutputs = [];
      for (let arg of args) {
        let path = arg === '-' || arg === './-' ? vfs.normalizePath(newCwd, '-', state.homeDir) : vfs.normalizePath(newCwd, arg, state.homeDir);
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

    case 'grep': {
      let invertMatch = false;
      let ignoreCase = false;
      const patternsAndFiles = [];

      for (const arg of args) {
        if (arg === '-v' || arg === '--invert-match') invertMatch = true;
        else if (arg === '-i' || arg === '--ignore-case') ignoreCase = true;
        else patternsAndFiles.push(arg);
      }

      const pattern = patternsAndFiles[0] || '';
      let textToSearch = stdinText;

      if (textToSearch === null && patternsAndFiles[1]) {
        const filePath = vfs.normalizePath(newCwd, patternsAndFiles[1], state.homeDir);
        const node = vfs.getNode(filePath);
        if (node && node.content) textToSearch = node.content;
      }

      if (textToSearch !== null) {
        const lines = textToSearch.split('\n');
        const flags = ignoreCase ? 'i' : '';
        const regex = new RegExp(pattern, flags);

        const matchedLines = lines.filter(line => {
          const match = regex.test(line);
          return invertMatch ? !match : match;
        });
        output = matchedLines.join('\n');
      } else {
        output = 'grep: missing search pattern or file';
      }
      break;
    }

    case 'base64': {
      let decode = false;
      let targetFile = null;

      for (const arg of args) {
        if (arg === '-d' || arg === '--decode') decode = true;
        else if (!arg.startsWith('-')) targetFile = arg;
      }

      let content = stdinText;
      if (content === null && targetFile) {
        const path = vfs.normalizePath(newCwd, targetFile, state.homeDir);
        const node = vfs.getNode(path);
        if (node && node.content) content = node.content;
      }

      if (content !== null) {
        try {
          if (decode) {
            output = atob(content.trim().replace(/\s/g, ''));
          } else {
            output = btoa(content);
          }
        } catch (err) {
          output = 'base64: invalid input payload';
        }
      } else {
        output = 'base64: missing file input';
      }
      break;
    }

    case 'head':
    case 'tail': {
      let numLines = 10;
      let fileArg = null;
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && args[i + 1]) {
          numLines = parseInt(args[i + 1], 10) || 10;
          i++;
        } else if (!args[i].startsWith('-')) {
          fileArg = args[i];
        }
      }

      let text = stdinText;
      if (text === null && fileArg) {
        const path = vfs.normalizePath(newCwd, fileArg, state.homeDir);
        const node = vfs.getNode(path);
        if (node && node.content) text = node.content;
      }

      if (text !== null) {
        const lines = text.split('\n');
        output = cmd === 'head' ? lines.slice(0, numLines).join('\n') : lines.slice(-numLines).join('\n');
      }
      break;
    }

    case 'wc': {
      let text = stdinText;
      if (text === null && args[0]) {
        const path = vfs.normalizePath(newCwd, args[0], state.homeDir);
        const node = vfs.getNode(path);
        if (node && node.content) text = node.content;
      }

      if (text !== null) {
        const lines = text.split('\n').length;
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const bytes = text.length;
        output = `  ${lines}  ${words}  ${bytes}`;
      }
      break;
    }

    case 'sort': {
      let text = stdinText;
      if (text === null && args[0]) {
        const path = vfs.normalizePath(newCwd, args[0], state.homeDir);
        const node = vfs.getNode(path);
        if (node && node.content) text = node.content;
      }

      if (text !== null) {
        output = text.split('\n').sort().join('\n');
      }
      break;
    }

    case 'uniq': {
      let text = stdinText;
      if (text === null && args[0]) {
        const path = vfs.normalizePath(newCwd, args[0], state.homeDir);
        const node = vfs.getNode(path);
        if (node && node.content) text = node.content;
      }

      if (text !== null) {
        const lines = text.split('\n');
        const countMap = {};
        for (const l of lines) {
          countMap[l] = (countMap[l] || 0) + 1;
        }

        if (args.includes('-u') || args.includes('--unique')) {
          output = lines.filter(l => countMap[l] === 1).join('\n');
        } else {
          output = Array.from(new Set(lines)).join('\n');
        }
      }
      break;
    }

    case 'mkdir': {
      if (!args[0]) output = 'mkdir: missing operand';
      else {
        for (const arg of args) {
          if (arg.startsWith('-')) continue;
          const target = vfs.normalizePath(newCwd, arg, state.homeDir);
          vfs.mkdir(target, currentUser, currentUser);
        }
      }
      break;
    }

    case 'touch': {
      if (!args[0]) output = 'touch: missing file operand';
      else {
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

      if (files.length === 0) output = 'rm: missing operand';
      else {
        for (const f of files) {
          const target = vfs.normalizePath(newCwd, f, state.homeDir);
          const res = vfs.rm(target, recursive);
          if (!res.success) output += `rm: cannot remove '${f}': ${res.error}\n`;
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

      if (paths.length < 2) output = 'cp: missing destination operand';
      else {
        const src = vfs.normalizePath(newCwd, paths[0], state.homeDir);
        const dest = vfs.normalizePath(newCwd, paths[1], state.homeDir);
        const res = vfs.cp(src, dest, recursive);
        if (!res.success) output = `cp: ${res.error}`;
      }
      break;
    }

    case 'mv': {
      if (args.length < 2) output = 'mv: missing destination operand';
      else {
        const src = vfs.normalizePath(newCwd, args[0], state.homeDir);
        const dest = vfs.normalizePath(newCwd, args[1], state.homeDir);
        const res = vfs.mv(src, dest);
        if (!res.success) output = `mv: ${res.error}`;
      }
      break;
    }

    case 'chmod': {
      if (args.length < 2) output = 'chmod: missing operand\nUsage: chmod 755 file';
      else {
        const mode = args[0];
        const file = args[1];
        const target = vfs.normalizePath(newCwd, file, state.homeDir);
        const node = vfs.getNode(target);
        if (!node) output = `chmod: cannot access '${file}': No such file or directory`;
        else {
          const res = vfs.chmod(node, mode);
          if (!res.success) output = `chmod: ${res.error}`;
        }
      }
      break;
    }

    case 'chown': {
      if (args.length < 2) output = 'chown: missing operand\nUsage: chown user:group file';
      else {
        const ownerGroup = args[0];
        const file = args[1];
        const target = vfs.normalizePath(newCwd, file, state.homeDir);
        const node = vfs.getNode(target);
        if (!node) output = `chown: cannot access '${file}': No such file or directory`;
        else vfs.chown(node, ownerGroup);
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
        if (args[i] === '-perm' && args[i + 1]) criteria.perm = args[i + 1];
        if (args[i] === '-not' && args[i + 1] === '-executable') criteria.notExecutable = true;
      }

      const res = vfs.find(startAbs, criteria);
      if (!res.success) output = `find: '${searchPath}': ${res.error}`;
      else output = res.results.join('\n');
      break;
    }

    case 'apt':
    case 'pacman': {
      const pkg = args[1] || args[0];
      output = `[${cmd.toUpperCase()}] Installing package '${pkg || 'linux-utils'}'...\nPackage installed successfully. Added system binary '/usr/bin/inspect-tool'.`;
      vfs.touch('/usr/bin/inspect-tool', 'Binary inspection utility', 'root', 'root', 'rwxr-xr-x');
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
        
        if (currentLevel === 7 && targetUser === 'user8') {
          const keyPath = vfs.normalizePath(newCwd, identityFile || 'id_rsa', state.homeDir);
          const keyNode = vfs.getNode(keyPath);

          if (!keyNode) {
            output = `ssh: Could not resolve file '${identityFile || 'id_rsa'}': No such file`;
            break;
          }

          if (keyNode.permissions !== 'rw-------') {
            output = `@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions ${keyNode.permissions} for '${keyNode.name}' are too open.
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

  return { output, newCwd, newPrevCwd, promptSSHModal, sshTargetUser };
}

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
