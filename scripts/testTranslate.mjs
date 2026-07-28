import translate from 'translate';

async function test() {
  translate.engine = 'google';
  const text = await translate('A strange seed was planted on its back at birth. The plant sprouts and grows with this POKéMON.', { to: 'pt' });
  console.log(text);
}
test();
