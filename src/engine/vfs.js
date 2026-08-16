// Virtual File System (VFS) for Lowkey Linux System Competition

export class VFS {
  constructor(initialTree = null) {
    this.root = initialTree || this.createDefaultTree();
  }

  createDefaultTree() {
    return {
      name: '/',
      type: 'dir',
      owner: 'root',
      group: 'root',
      permissions: 'rwxr-xr-x',
      mtime: 'Aug 11 12:00',
      children: {
        'home': {
          name: 'home',
          type: 'dir',
          owner: 'root',
          group: 'root',
          permissions: 'rwxr-xr-x',
          mtime: 'Aug 11 12:00',
          children: {
            'user0': {
              name: 'user0',
              type: 'dir',
              owner: 'user0',
              group: 'user0',
              permissions: 'rwxr-x---',
              mtime: 'Aug 11 12:00',
              children: {
                'readme': {
                  name: 'readme',
                  type: 'file',
                  owner: 'user0',
                  group: 'user0',
                  permissions: 'rw-r--r--',
                  size: 33,
                  mtime: 'Aug 11 12:00',
                  content: 'NH7nx1LgT89k3vPZ'
                }
              }
            }
          }
        },
        'usr': {
          name: 'usr',
          type: 'dir',
          owner: 'root',
          group: 'root',
          permissions: 'rwxr-xr-x',
          mtime: 'Aug 11 12:00',
          children: {
            'bin': {
              name: 'bin',
              type: 'dir',
              owner: 'root',
              group: 'root',
              permissions: 'rwxr-xr-x',
              mtime: 'Aug 11 12:00',
              children: {
                'bash': { name: 'bash', type: 'file', owner: 'root', group: 'root', permissions: 'rwxr-xr-x', size: 12345, mtime: 'Aug 11 12:00', content: 'ELF binary' }
              }
            }
          }
        },
        'etc': {
          name: 'etc',
          type: 'dir',
          owner: 'root',
          group: 'root',
          permissions: 'rwxr-xr-x',
          mtime: 'Aug 11 12:00',
          children: {
            'sys_pass': {
              name: 'sys_pass',
              type: 'dir',
              owner: 'root',
              group: 'root',
              permissions: 'rwxr-x---',
              mtime: 'Aug 11 12:00',
              children: {
                'user0': { name: 'user0', type: 'file', owner: 'root', group: 'user0', permissions: 'r--r-----', size: 16, mtime: 'Aug 11 12:00', content: 'user0_start_key' },
                'user1': { name: 'user1', type: 'file', owner: 'root', group: 'user1', permissions: 'r--r-----', size: 16, mtime: 'Aug 11 12:00', content: 'NH7nx1LgT89k3vPZ' },
                'user2': { name: 'user2', type: 'file', owner: 'root', group: 'user2', permissions: 'r--r-----', size: 16, mtime: 'Aug 11 12:00', content: 'r48xP02kM91LqW7z' },
                'user3': { name: 'user3', type: 'file', owner: 'root', group: 'user3', permissions: 'r--r-----', size: 16, mtime: 'Aug 11 12:00', content: 'Um83n2x9V1kL04pQ' },
                'user4': { name: 'user4', type: 'file', owner: 'root', group: 'user4', permissions: 'r--r-----', size: 16, mtime: 'Aug 11 12:00', content: 'pQ79vX01kL34n2m8' },
                'user5': { name: 'user5', type: 'file', owner: 'root', group: 'user5', permissions: 'r--r-----', size: 16, mtime: 'Aug 11 12:00', content: 'koP89n31xQ45vL72' },
                'user6': { name: 'user6', type: 'file', owner: 'root', group: 'user6', permissions: 'r--r-----', size: 16, mtime: 'Aug 11 12:00', content: 'DX7kM023nL19vP84' },
                'user7': { name: 'user7', type: 'file', owner: 'root', group: 'user7', permissions: 'r--r-----', size: 16, mtime: 'Aug 11 12:00', content: 'zK89pX02mL14vN93' },
                'user8': { name: 'user8', type: 'file', owner: 'root', group: 'user8', permissions: 'r--r-----', size: 16, mtime: 'Aug 11 12:00', content: 'qP90mL34vX81n2k7' }
              }
            }
          }
        },
        'var': {
          name: 'var',
          type: 'dir',
          owner: 'root',
          group: 'root',
          permissions: 'rwxr-xr-x',
          mtime: 'Aug 11 12:00',
          children: {
            'log': { name: 'log', type: 'dir', owner: 'root', group: 'root', permissions: 'rwxr-xr-x', mtime: 'Aug 11 12:00', children: {} }
          }
        }
      }
    };
  }

  // Normalize path relative to working directory and user home
  normalizePath(cwd, targetPath, homeDir = '/home/user0') {
    if (!targetPath) return cwd;
    let path = targetPath.trim();

    if (path.startsWith('~')) {
      path = homeDir + path.slice(1);
    }

    let parts;
    if (path.startsWith('/')) {
      parts = path.split('/');
    } else {
      parts = (cwd === '/' ? '' : cwd).split('/').concat(path.split('/'));
    }

    const stack = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') {
        if (stack.length > 0) stack.pop();
      } else {
        stack.push(part);
      }
    }

    return '/' + stack.join('/');
  }

  // Retrieve node object given absolute path
  getNode(path) {
    if (path === '/') return this.root;
    const parts = path.split('/').filter(Boolean);
    let curr = this.root;

    for (const part of parts) {
      if (!curr || curr.type !== 'dir' || !curr.children) return null;
      curr = curr.children[part];
    }
    return curr || null;
  }

  // Get parent directory node and item name
  getParentAndName(path) {
    const normalized = path.replace(/\/+$/, '');
    const lastSlash = normalized.lastIndexOf('/');
    if (lastSlash === -1) return { parent: null, name: '' };
    
    const parentPath = normalized.slice(0, lastSlash) || '/';
    const name = normalized.slice(lastSlash + 1);
    return { parentPath, parent: this.getNode(parentPath), name };
  }

  // Check read/write/execute permissions
  hasPermission(node, user, mode = 'r') {
    if (!node) return false;
    if (user === 'root') return true;

    const perms = node.permissions;
    if (!perms || perms.length !== 9) return true;

    let userRole = 'other';
    if (node.owner === user) userRole = 'owner';
    else if (node.group === user) userRole = 'group';

    let offset = 6;
    if (userRole === 'owner') offset = 0;
    else if (userRole === 'group') offset = 3;

    if (mode === 'r') return perms[offset] === 'r';
    if (mode === 'w') return perms[offset + 1] === 'w';
    if (mode === 'x') return perms[offset + 2] === 'x';
    return false;
  }

  // Create directory
  mkdir(path, owner = 'user0', group = 'user0', permissions = 'rwxr-xr-x') {
    const norm = path.startsWith('/') ? path : '/' + path;
    const parts = norm.split('/').filter(Boolean);
    let curr = this.root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!curr.children) curr.children = {};
      if (!curr.children[part]) {
        curr.children[part] = {
          name: part,
          type: 'dir',
          owner: owner || 'user0',
          group: group || 'user0',
          permissions,
          mtime: 'Aug 11 12:00',
          children: {}
        };
      }
      curr = curr.children[part];
    }
    return curr;
  }

  // Create or touch file
  touch(path, content = '', owner = 'user0', group = 'user0', permissions = 'rw-r--r--') {
    const { parent, name } = this.getParentAndName(path);
    if (!parent || parent.type !== 'dir') return { success: false, error: 'No such file or directory' };

    if (parent.children[name]) {
      // Update mtime, content, owner, group, and permissions if provided
      parent.children[name].mtime = 'Aug 11 12:00';
      if (content !== undefined && content !== null) {
        parent.children[name].content = content;
        parent.children[name].size = content.length;
      }
      if (owner) parent.children[name].owner = owner;
      if (group) parent.children[name].group = group;
      if (permissions) parent.children[name].permissions = permissions;
    } else {
      parent.children[name] = {
        name,
        type: 'file',
        owner,
        group,
        permissions,
        size: content.length,
        mtime: 'Aug 11 12:00',
        content
      };
    }
    return { success: true };
  }

  // Remove file or directory
  rm(path, recursive = false) {
    const { parent, name } = this.getParentAndName(path);
    if (!parent || !parent.children[name]) return { success: false, error: 'No such file or directory' };

    const target = parent.children[name];
    if (target.type === 'dir' && !recursive) {
      return { success: false, error: 'Is a directory (use -r to remove directories)' };
    }

    delete parent.children[name];
    return { success: true };
  }

  // Copy file or directory
  cp(srcPath, destPath, recursive = false) {
    const srcNode = this.getNode(srcPath);
    if (!srcNode) return { success: false, error: 'No such file or directory' };
    if (srcNode.type === 'dir' && !recursive) return { success: false, error: '-r not specified; omitting directory' };

    let targetPath = destPath;
    const destNode = this.getNode(destPath);
    if (destNode && destNode.type === 'dir') {
      const srcName = srcPath.split('/').pop();
      targetPath = (destPath === '/' ? '' : destPath) + '/' + srcName;
    }

    const { parent, name } = this.getParentAndName(targetPath);
    if (!parent) return { success: false, error: 'No such file or directory' };

    // Deep clone node
    parent.children[name] = JSON.parse(JSON.stringify(srcNode));
    parent.children[name].name = name;
    return { success: true };
  }

  // Move file or directory
  mv(srcPath, destPath) {
    const cpRes = this.cp(srcPath, destPath, true);
    if (!cpRes.success) return cpRes;
    return this.rm(srcPath, true);
  }

  // Chmod modification handler (octal e.g. 755 or symbolic e.g. +x, u+x, 600)
  chmod(node, modeStr) {
    if (!node) return { success: false, error: 'No such file or directory' };

    // Check octal mode e.g. 755, 600, 644
    if (/^[0-7]{3}$/.test(modeStr)) {
      const octalToPerm = (digit) => {
        const val = parseInt(digit, 10);
        return (val & 4 ? 'r' : '-') + (val & 2 ? 'w' : '-') + (val & 1 ? 'x' : '-');
      };
      const u = octalToPerm(modeStr[0]);
      const g = octalToPerm(modeStr[1]);
      const o = octalToPerm(modeStr[2]);
      node.permissions = u + g + o;
      return { success: true };
    }

    // Symbolic modes like +x, u+x, g-w, a+r
    const symMatch = modeStr.match(/^([ugo]*)([\+\-=])([rwx]+)$/);
    if (symMatch) {
      let [, who, op, permChars] = symMatch;
      if (!who) who = 'ugo';

      let perms = node.permissions.split('');
      const targets = [];
      if (who.includes('u') || who === 'ugo') targets.push(0);
      if (who.includes('g') || who === 'ugo') targets.push(3);
      if (who.includes('o') || who === 'ugo') targets.push(6);

      for (const targetOffset of targets) {
        for (const char of permChars) {
          let pos = targetOffset;
          if (char === 'r') pos += 0;
          else if (char === 'w') pos += 1;
          else if (char === 'x') pos += 2;

          if (op === '+') perms[pos] = char;
          else if (op === '-') perms[pos] = '-';
          else if (op === '=') {
            perms[targetOffset] = permChars.includes('r') ? 'r' : '-';
            perms[targetOffset + 1] = permChars.includes('w') ? 'w' : '-';
            perms[targetOffset + 2] = permChars.includes('x') ? 'x' : '-';
          }
        }
      }
      node.permissions = perms.join('');
      return { success: true };
    }

    return { success: false, error: `Invalid mode: ${modeStr}` };
  }

  // Chown modification handler (user:group or user)
  chown(node, ownerGroupStr) {
    if (!node) return { success: false, error: 'No such file or directory' };
    const parts = ownerGroupStr.split(':');
    if (parts[0]) node.owner = parts[0];
    if (parts[1]) node.group = parts[1];
    return { success: true };
  }

  // Recursive find command implementation
  find(startPath, criteria = {}) {
    const results = [];
    const startNode = this.getNode(startPath);
    if (!startNode) return { success: false, error: 'No such file or directory', results: [] };

    const traverse = (node, currentPath) => {
      let matches = true;

      if (criteria.name) {
        const cleanNamePattern = criteria.name.replace(/^['"]|['"]$/g, '');
        const regexStr = '^' + cleanNamePattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
        const regex = new RegExp(regexStr, 'i');
        if (!regex.test(node.name)) matches = false;
      }

      if (criteria.type) {
        if (criteria.type === 'f' && node.type !== 'file') matches = false;
        if (criteria.type === 'd' && node.type !== 'dir') matches = false;
      }

      if (criteria.user) {
        const targetUser = criteria.user.toLowerCase();
        const owner = (node.owner || '').toLowerCase();
        if (owner !== targetUser && !owner.startsWith(targetUser)) matches = false;
      }

      if (criteria.group) {
        const targetGroup = criteria.group.toLowerCase();
        const group = (node.group || '').toLowerCase();
        if (group !== targetGroup && !group.startsWith(targetGroup)) matches = false;
      }

      if (criteria.size !== undefined) {
        let reqSize = criteria.size;
        if (typeof reqSize === 'string' && reqSize.endsWith('c')) {
          reqSize = parseInt(reqSize.slice(0, -1), 10);
        } else if (typeof reqSize === 'string' && reqSize.endsWith('k')) {
          reqSize = parseInt(reqSize.slice(0, -1), 10) * 1024;
        }
        if (node.size !== reqSize) matches = false;
      }

      if (criteria.notExecutable && this.hasPermission(node, node.owner || 'root', 'x')) matches = false;

      if (criteria.empty) {
        if (node.type === 'file' && (node.size !== 0 && node.content !== '')) matches = false;
        if (node.type === 'dir' && Object.keys(node.children || {}).length > 0) matches = false;
      }

      if (matches) results.push(currentPath);

      if (node.type === 'dir' && node.children) {
        for (const childName in node.children) {
          const childPath = (currentPath === '/' ? '' : currentPath) + '/' + childName;
          traverse(node.children[childName], childPath);
        }
      }
    };

    traverse(startNode, startPath);
    return { success: true, results };
  }

  // Format node for ls -l output
  formatLongListing(node, name) {
    const typeChar = node.type === 'dir' ? 'd' : '-';
    const perms = typeChar + (node.permissions || 'rw-r--r--');
    const links = node.type === 'dir' ? 2 : 1;
    const owner = (node.owner || 'user0').padEnd(8);
    const group = (node.group || 'user0').padEnd(8);
    const size = String(node.size || 4096).padStart(6);
    const mtime = node.mtime || 'Aug 11 12:00';
    return `${perms} ${links} ${owner} ${group} ${size} ${mtime} ${name}`;
  }
}
