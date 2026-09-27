const http = require('http');

function post(url, data, headers) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: 'POST',
        headers: Object.assign(
          { 'Content-Type': 'application/json', 'Content-Length': body.length },
          headers || {},
        ),
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => resolve(JSON.parse(b)));
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    http
      .get(
        {
          hostname: u.hostname,
          port: u.port,
          path: u.pathname + u.search,
          headers: headers || {},
        },
        (res) => {
          let b = '';
          res.on('data', (c) => (b += c));
          res.on('end', () => resolve(JSON.parse(b)));
        },
      )
      .on('error', reject);
  });
}

async function main() {
  const login = await post('http://localhost:3001/api/auth/login', {
    email: 'admin@lemigas.esdm.go.id',
    password: 'admin123',
  });
  var token = login && login.akses && login.akses[0] && login.akses[0].token;
  if (!token) {
    console.log('LOGIN FAILED:', JSON.stringify(login));
    process.exit(1);
  }
  console.log('Login OK');

  var auth = { Authorization: 'Bearer ' + token };

  var endpoints = [
    ['GET /api/vendor', '/api/vendor?limit=3&page=1'],
    ['GET /api/barang', '/api/barang?limit=3&page=1'],
    ['GET /api/pengadaan', '/api/pengadaan?limit=3&page=1'],
    ['GET /api/kategori', '/api/kategori?limit=3&page=1'],
    ['GET /api/user', '/api/user?limit=3&page=1'],
    ['GET /api/dokumen', '/api/dokumen?limit=3&page=1'],
    ['GET /api/notifikasi', '/api/notifikasi?limit=3&page=1'],
    ['GET /api/audit-log', '/api/audit-log?limit=3&page=1'],
    ['GET /api/dashboard', '/api/dashboard'],
    ['GET /api/approval', '/api/approval?limit=3&page=1'],
  ];

  for (var i = 0; i < endpoints.length; i++) {
    var label = endpoints[i][0];
    var path = endpoints[i][1];
    try {
      var res = await get('http://localhost:3001' + path, auth);
      var count = Array.isArray(res && res.data)
        ? res.data.length
        : res && res.data
          ? 1
          : 0;
      var pag = res && res.pagination;
      console.log(
        label +
          ': status=' +
          (res && res.status) +
          ' data_count=' +
          count +
          ' total_datas=' +
          (pag ? pag.total_datas : 'N/A'),
      );
    } catch (e) {
      console.log(label + ': ERROR ' + e.message);
    }
  }
}

main();
