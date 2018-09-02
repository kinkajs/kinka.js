<p align="center">
<img src="https://kinkajs.github.io/kinka.js/kinkajs.png">
</p>

## kinka.js とは
ウェブページ内を自由に飛びまわる8bit風の **かわいいキンカチョウ (英:Zebra finch)** が表示できます  
[デモはこちら](https://kinkajs.github.io/kinka.js/)

あなたのウェブページでキンカチョウを飼ってみませんか？  

## Install
### bower
```
bower install kinkajs
```

### npm
```
npm install kinkajs
```

## 使い方
```html
<head>
  <script src="./bower_components/kinkajs/kinka.js"></script>
</head>
<body>
  <div class="kinka"></div>
  <div class="yourtag perch"></div>
</body>
```
* kinka.jsを読み込みます
* class名に `kinka` と付けたDIVタグを書きます。このタグの数だけキンカチョウが表示されます
* 任意のタグのclass名に `perch (止まり木)` を追加すると、そのタグの上部にキンカチョウが止まってくれます
* 画面上をロングタップするとキンカチョウが止まりに来ます

## その他の設定パラメータ
`キンカチョウの画像` と `一番最初に止まるタグ` を設定することが可能です
```html
<div class="kinka kinkasp2 perch3"></div>
```
* `kinkasp2` でキンカチョウの画像を変更します (`kinkasp1` `kinkasp2` `kinkasp3` が利用できます)
* `perch3` で一番最初に止まるタグを変更します (`perch (止まり木)` を指定したタグの数で変わります)

## スプライト画像のカスタマイズ方法
```javascript
const ASSET_FILES = ["sprite.png", "sprite2.png", "sprite3.png"]
const KINKA_SIZE = 50
const KINKA_BOTTOM_OFFSET = 10
```
* 上記コードを自由に変更してください
* キンカチョウのスプライト画像は `停止状態` `停止状態` `停止状態` `歩き状態` `歩き状態` `飛行状態` `飛行状態` `飛行状態` の8コマです
    * 各コマは正方形にしてください
    * 大きさは自由です
* `KINKA_SIZE` はキンカチョウの表示サイズ、 `KINKA_BOTTOM_OFFSET` はスプライト画像の下部の余白に対する調整値です

## Team kinka.js
* まつ : 企画、開発
* Market U : キンカチョウ監修、ドット絵
* ハッちゃん : キンカチョウ (ドット絵モデル)

## ライセンス
### The MIT License (MIT)  

Copyright 2018 Team kinka.js