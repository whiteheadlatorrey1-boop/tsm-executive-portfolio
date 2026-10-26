/* Public clip metadata only; no filesystem paths or credentials. */
(function(root){'use strict';const tracks=[
  {
    "id": "architecture",
    "src": "assets/audio/01-architecture.mp3",
    "durationSeconds": 20.154920634920636,
    "sha256": "b4d1b8a170eb1b77a8177d9c0580f8095683db174cf5e3ead07c13cc40ae5dd5",
    "captionSha256": "64dd82ae302574942a8fef2c281f3bfcbdad9896a4d2691d5db17e6bf0cfc1c3"
  },
  {
    "id": "industrial-input",
    "src": "assets/audio/02-industrial-input.mp3",
    "durationSeconds": 14.86077097505669,
    "sha256": "f3eccbfc83817bc80fb9db9d39d9985ed293b7829669772b71239e8fa76bff8c",
    "captionSha256": "d20b1623d500de1e407a34d9498e4df49965ad32faaa543a48b265b562f5a5a9"
  },
  {
    "id": "industrial-analysis",
    "src": "assets/audio/03-industrial-analysis.mp3",
    "durationSeconds": 18.99392290249433,
    "sha256": "09d29c1ea4b6eeef7b0b20fdd92a9a40a436a60720ee96efe13f8e07a7941e54",
    "captionSha256": "3ef75afc06fefd0502d1d7986ee155a5e028f4f53fa495464691ac416666f1f8"
  },
  {
    "id": "industrial-strategist",
    "src": "assets/audio/04-industrial-strategist.mp3",
    "durationSeconds": 15.998548752834466,
    "sha256": "bd657dca9996b74aa263b643794bcd0863809ca393f5e9d34c32631273c12c89",
    "captionSha256": "49371963715cc8ed9cf679412857bab1cea4c8d01e8dde295df3e2f861ab4ce4"
  },
  {
    "id": "industrial-executive",
    "src": "assets/audio/05-industrial-executive.mp3",
    "durationSeconds": 18.134784580498867,
    "sha256": "4d0e1179d80284c49816bdffe29293b267d6aabce490276961fb47841766a346",
    "captionSha256": "898ca404d90e4050250121dd4109de934608387ef94db0dd8c8504a51ddc7c03"
  },
  {
    "id": "l1-context",
    "src": "assets/audio/06-l1-context.mp3",
    "durationSeconds": 13.87392290249433,
    "sha256": "c1e8b9ddd3c2335dfae76249bb666b34b39c0fd6592ff506b060cf8eae09d16f",
    "captionSha256": "c621344cb5b86ca7221fbf00d72f0a114ae663e56b1c5784ca5d1b58d00b7fd7"
  },
  {
    "id": "l1-guide",
    "src": "assets/audio/07-l1-guide.mp3",
    "durationSeconds": 17.124716553287982,
    "sha256": "26e0c78860c3cdb61a31749f816b36ef3afe0f9cf3ae99e28663c67867704c07",
    "captionSha256": "e6c578820cdc72da225fd27184ec70ab532f133be88055e19e574fc8dbac88e0"
  },
  {
    "id": "l1-script",
    "src": "assets/audio/08-l1-script.mp3",
    "durationSeconds": 14.988480725623583,
    "sha256": "932a2891f43d3c9cdd55d53dd53a14542c126d43ac22aea1ccca71832b3ce66f",
    "captionSha256": "078b48bac25881fb97d3aae5aa2576756fc5fb1abc2dff2835c40eb3de1b0bb6"
  },
  {
    "id": "l1-handoff",
    "src": "assets/audio/09-l1-handoff.mp3",
    "durationSeconds": 13.246984126984128,
    "sha256": "b540c2c4a0c617493f87f886eb6867d571a97fa0da2ea22dc52e274858f99468",
    "captionSha256": "93fa3c814c9884ea5d0562f6c322c08a660b5f37a0da364b8e64d038ce231fa4"
  },
  {
    "id": "temporal-request",
    "src": "assets/audio/10-temporal-request.mp3",
    "durationSeconds": 15.17424036281179,
    "sha256": "f257aadc080a863b829a099002e63002b556d8b89c36a7ba7006f7ee046432e3",
    "captionSha256": "f1b81543bf164fce4ee1cc4dc3335eec4e8556019f982216973ecaabb440abed"
  },
  {
    "id": "temporal-approval",
    "src": "assets/audio/11-temporal-approval.mp3",
    "durationSeconds": 14.744671201814059,
    "sha256": "3be9a368a726107049de76a60b6d0e038b3ffc32afc8372b5d22925ca4945032",
    "captionSha256": "7768a6d45177934a84673077d3ee75a2457d801f8f0755a1353a388282484fbf"
  },
  {
    "id": "temporal-outcome",
    "src": "assets/audio/12-temporal-outcome.mp3",
    "durationSeconds": 16.764807256235827,
    "sha256": "64eb0b9b968e9fec072b69013baa5b8e0d80c87481b18387906a1309206b87ff",
    "captionSha256": "def56e38fd64c3ceb1943e986064ede395338ea6cf16d18a1e8d76560341bb75"
  },
  {
    "id": "document-governance",
    "src": "assets/audio/13-document-governance.mp3",
    "durationSeconds": 16.61387755102041,
    "sha256": "61206321a82d7ec911057f2c79c1931ca5ae44eafb09385dd7f685cb43b39425",
    "captionSha256": "b7e9e55391db98873c4bc24473972f0dd4d3dde99b3bd7d688a3b16091271dbe"
  },
  {
    "id": "document-review",
    "src": "assets/audio/14-document-review.mp3",
    "durationSeconds": 15.12780045351474,
    "sha256": "6e54ef298a7764a2d9a16654e2cb1da8c914ba5fa467dcae2d85f155db673869",
    "captionSha256": "8050836031580b505f1d60484c33f4587dc72bc33ec824c381976747ca9ea671"
  },
  {
    "id": "governed-outcome",
    "src": "assets/audio/15-governed-outcome.mp3",
    "durationSeconds": 17.949024943310658,
    "sha256": "b545f74d31f4c8497c981c310577ee598e2bc3b67a7432f4c1fd9ca0fac5f7ca",
    "captionSha256": "48fc160d8c3f6b8288e7632ca5c3cc682ed18ab1fd2ce9e658a46fd13fd92ed5"
  },
  {
    "id": "executive-close",
    "src": "assets/audio/16-executive-close.mp3",
    "durationSeconds": 15.85922902494331,
    "sha256": "60c0dca22467447fec4f6811dfbd902d370e53b2ce55615c264376dea59e299f",
    "captionSha256": "94d9ab7d9c4469e455440d10863b68c07cbfd76ab559b2d53afc3f19266f1331"
  }
];if(typeof module==='object'&&module.exports)module.exports=tracks;else root.TSMRecordedTracks=tracks;})(typeof window!=='undefined'?window:globalThis);
