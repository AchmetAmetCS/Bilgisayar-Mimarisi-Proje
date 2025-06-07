let encodedData = [];
let errorData = [];

function writeToMemory() {
  const input = document.getElementById('data-input').value.trim().replaceAll(' ', '');
  const bitLength = parseInt(document.getElementById('bit-length').value);

  if (!/^[01]+$/.test(input) || input.length !== bitLength) {
    alert(`Lütfen ${bitLength} bitlik sadece 0 ve 1'lerden oluşan bir veri giriniz.`);
    return;
  }

  encodedData = hammingEncodeSECDED(input);
  errorData = [...encodedData];
  document.getElementById('encoded-output').textContent = encodedData.join('');
  document.getElementById('error-output').textContent = '-';
  document.getElementById('result-output').textContent = 'Veri belleğe yazıldı.';
}

function injectError() {
  if (encodedData.length === 0) {
    alert('Önce belleğe veri yazmalısın!');
    return;
  }

  errorData = [...encodedData];
  const errorBit = Math.floor(Math.random() * errorData.length);
  errorData[errorBit] = errorData[errorBit] === '0' ? '1' : '0';

  document.getElementById('error-output').textContent = errorData.join('');
  document.getElementById('result-output').textContent = `${errorBit}. bit bozuldu.`;
}

function checkAndCorrect() {
  if (errorData.length === 0) {
    alert('Önce hata enjekte edilmemiş.');
    return;
  }

  const { correctedData, message } = hammingDecodeSECDED(errorData);
  document.getElementById('result-output').textContent = message;
}


function hammingEncodeSECDED(data) {
  const m = data.length;
  let r = 0;

  while (Math.pow(2, r) < m + r + 1) r++;

  const totalLength = m + r + 1;
  const encoded = Array(totalLength).fill('0');
  let j = 0;

  for (let i = 1; i < totalLength; i++) {
    if ((i & (i - 1)) !== 0) {
      encoded[i] = data[j++];
    }
  }

  for (let i = 0; i < r; i++) {
    let parity = 0;
    for (let j = 1; j < totalLength; j++) {
      if ((j >> i) & 1) {
        parity ^= parseInt(encoded[j]);
      }
    }
    encoded[Math.pow(2, i)] = parity.toString();
  }

  const overallParity = encoded.reduce((acc, bit) => acc ^ parseInt(bit), 0);
  encoded[0] = overallParity.toString();

  return encoded;
}

function hammingDecodeSECDED(received) {
  const bits = received.map(Number);
  const n = bits.length;
  const r = Math.floor(Math.log2(n));
  let syndrome = 0;

  for (let i = 0; i < r; i++) {
    let parity = 0;
    for (let j = 1; j < n; j++) {
      if ((j >> i) & 1) {
        parity ^= bits[j];
      }
    }
    if (parity !== 0) {
      syndrome |= (1 << i);
    }
  }

  const overallParity = bits.reduce((acc, bit) => acc ^ bit, 0);

  let message;
  if (overallParity === 0 && syndrome === 0) {
    message = 'Veride hata yok.';
  } else if (overallParity === 1 && syndrome !== 0) {
    bits[syndrome] ^= 1;
    message = `Tek bitlik hata tespit edildi ve ${syndrome}. bit düzeltildi.`;
  } else if (overallParity === 1 && syndrome === 0) {
    message = 'İki bitlik hata tespit edildi, düzeltilemez.';
  } else {
    message = 'Beklenmedik bir durum oluştu.';
  }

  return {
    correctedData: bits,
    message: message
  };
}
