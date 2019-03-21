// canvas とクォータニオンをグローバルに扱う
var c;
var q = new qtnIV();
var qt = q.identity(q.create());
var radian;

// マウスムーブイベントに登録する処理
function mouseMove(e){
	var cw = c.width;
	var ch = c.height;
	var wh = 1 / Math.sqrt(cw * cw + ch * ch);
	var x = e.clientX - c.offsetLeft - cw * 0.5;
	var y = e.clientY - c.offsetTop - ch * 0.5;
	var sq = Math.sqrt(x * x + y * y);
	var r = sq * 2.0 * Math.PI * wh;
	if(sq != 1){
		sq = 1 / sq;
		x *= sq;
		y *= sq;
	}
	q.rotate(r, [y, x, 0.0], qt);
	radian = r;
}



onload = function(){
    // canvasエレメントを取得
    c = document.getElementById('canvas');
		// input range エレメント
		var eRange = document.getElementById('range');
		var numRange = document.getElementById('numrange');

console.log(numRange);

    c.width = 1500;
    c.height = 720;

    function canvas_resize(){
      var windowInnerWidth=window.innerWidth;
      var windowInnerHeight=window.innerHeight;

      c.setAttribute('width',windowInnerWidth);
      c.setAttribute('height',windowInnerHeight);
    }

    // canvas のマウスムーブイベントに処理を登録
    c.addEventListener('mousemove', mouseMove, true);
    window.addEventListener('resize',canvas_resize,false);

    canvas_resize();


    // webglコンテキストを取得
		var gl = canvas.getContext('webgl', {stencil: true}) || canvas.getContext('experimental-webgl', {stencil: true});
  	// 頂点シェーダとフラグメントシェーダの生成
  	var v_shader = create_shader('vs');
  	var f_shader = create_shader('fs');

  	// プログラムオブジェクトの生成とリンク
  	var prg = create_program(v_shader, f_shader);

  	// attributeLocationを配列に取得
  	var attLocation = new Array();
  	attLocation[0] = gl.getAttribLocation(prg, 'position');
  	attLocation[1] = gl.getAttribLocation(prg, 'normal');
  	attLocation[2] = gl.getAttribLocation(prg, 'color');
		attLocation[3] = gl.getAttribLocation(prg, 'textureCoord');


  	// attributeの要素数を配列に格納
  	var attStride = new Array();
  	attStride[0] = 3;
  	attStride[1] = 3;
  	attStride[2] = 4;
		attStride[3] = 2;


  	// トーラスの頂点データからVBOを生成し配列に格納
  	var torusData = torus(64, 64, 0.05, 3.5, [0.25, 0.25, 0.75, 1.0]);
  	var tPosition = create_vbo(torusData.p);
  	var tNormal   = create_vbo(torusData.n);
  	var tColor    = create_vbo(torusData.c);

  	var tVBOList  = [tPosition, tNormal, tColor];

  	// トーラス用IBOの生成
  	var tIndex = create_ibo(torusData.i);

  	// 球体の頂点データからVBOを生成し配列に格納
  	var sphereData = sphere(64, 64, 2.0, [0.25, 0.25, 0.75, 1.0]);
  	var sPosition = create_vbo(sphereData.p);
  	var sNormal   = create_vbo(sphereData.n);
  	var sColor    = create_vbo(sphereData.c);
		var sTextureCoord = create_vbo(sphereData.t);
		var sVBOList      = [sPosition, sNormal, sColor, sTextureCoord];

  	// 球体用IBOの生成
  	var sIndex = create_ibo(sphereData.i);

  	// uniformLocationを配列に取得
  	var uniLocation = new Array();
  	uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
  	uniLocation[1] = gl.getUniformLocation(prg, 'mMatrix');
  	uniLocation[2] = gl.getUniformLocation(prg, 'invMatrix');
  	uniLocation[3] = gl.getUniformLocation(prg, 'lightPosition');
  	uniLocation[4] = gl.getUniformLocation(prg, 'eyeDirection');
  	uniLocation[5] = gl.getUniformLocation(prg, 'ambientColor');
		uniLocation[6] = gl.getUniformLocation(prg, 'outline');
		uniLocation[7] = gl.getUniformLocation(prg, 'texture');
		uniLocation[8] = gl.getUniformLocation(prg, 'useTexture');

		// ブラーフィルター用シェーダ-start----------------------------------------

		// 頂点シェーダとフラグメントシェーダ、プログラムオブジェクトの生成
		v_shader = create_shader('bvs');
		f_shader = create_shader('bfs');
		var bPrg = create_program(v_shader, f_shader);

		// attributeLocationを配列に取得
		var bAttLocation = new Array();
		bAttLocation[0] = gl.getAttribLocation(bPrg, 'position');
		bAttLocation[1] = gl.getAttribLocation(bPrg, 'color');

		// attributeの要素数を配列に格納
		var bAttStride = new Array();
		bAttStride[0] = 3;
		bAttStride[1] = 4;

		// 頂点の位置
		var position = [
				-1.0,  1.0,  0.0,
				 1.0,  1.0,  0.0,
				-1.0, -1.0,  0.0,
				 1.0, -1.0,  0.0
		];

		// 頂点色
		var color = [
				1.0, 1.0, 1.0, 1.0,
				1.0, 1.0, 1.0, 1.0,
				1.0, 1.0, 1.0, 1.0,
				1.0, 1.0, 1.0, 1.0
		];

		// 頂点インデックス
		var index = [
				0, 1, 2,
				3, 2, 1
		];

		// VBOとIBOの生成
		var vPosition     = create_vbo(position);
		var vColor        = create_vbo(color);
		var vVBOList      = [vPosition, vColor];
		var vIndex        = create_ibo(index);

		// uniformLocationを配列に取得
		var bUniLocation = new Array();
		bUniLocation[0] = gl.getUniformLocation(bPrg, 'mvpMatrix');
		bUniLocation[1] = gl.getUniformLocation(bPrg, 'texture');
		bUniLocation[2] = gl.getUniformLocation(bPrg, 'useBlur');

		// ブラーフィルター用-end--------------------------------------------------


  	// minMatrix.js を用いた行列関連処理
  	// matIVオブジェクトを生成
  	var m = new matIV();


  	// 各種行列の生成と初期化
  	var mMatrix = m.identity(m.create());
  	var vMatrix = m.identity(m.create());
  	var pMatrix = m.identity(m.create());
  	var tmpMatrix = m.identity(m.create());
  	var mvpMatrix = m.identity(m.create());
  	var invMatrix = m.identity(m.create());

  	// 点光源の位置
  	var lightPosition = [-10.0, 10.0, 0.0];

  	// 環境光の色
  	var ambientColor = [0.1, 0.1, 0.1, 1.0];

  	// 視点ベクトル
  	var eyeDirection = [0.0, 0.0, 20.0];

  	// ビュー×プロジェクション座標変換行列
  	m.lookAt(eyeDirection, [0, 0, 0], [0, 1, 0], vMatrix);
  	m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
  	m.multiply(pMatrix, vMatrix, tmpMatrix);



    // カメラの座標
    var camPosition = [0.0, 0.0, 10.0];

    // カメラの上方向を表すベクトル
    var camUpDirection = [0.0, 1.0, 0.0];


				// 各種クォータニオンの生成と初期化
		var q = new qtnIV();
		var aQuaternion = q.identity(q.create());
		var bQuaternion = q.identity(q.create());
		var sQuaternion = q.identity(q.create());

		var sQuaternions = new Array(5);

		for(var i = 0; i < sQuaternions.length;i++){
			sQuaternions[i] = q.identity(q.create());
		}

    // カウンタの宣言
    var count = 0;

  	// カリングと深度テスト、ステンシルテストを有効にする
  	gl.enable(gl.DEPTH_TEST);
  	gl.depthFunc(gl.LEQUAL);
  	gl.enable(gl.CULL_FACE);
		gl.frontFace(gl.CW);
		gl.enable(gl.STENCIL_TEST);

		// テクスチャ用変数の宣言と生成
		var texture = null;
		create_texture('img/texture.png');

		// フレームバッファオブジェクトの取得
		var fBufferWidth  = 256;
		var fBufferHeight = 256;
		var fBuffer = create_framebuffer(fBufferWidth, fBufferHeight);




  	// 恒常ループ
  	(function(){



  		// canvasを初期化
  		gl.clearColor(0.3, 0.3, 0.8, 1.0);
  		gl.clearDepth(1.0);
  		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

  		// カウンタをインクリメントする
  		count++;
			count++;

      // カウンタを元にラジアンを算出
  		var rad  = (count % 180) * Math.PI / 90;

			// テクスチャをバインド
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);


			// 経過時間係数を算出
	    var time = eRange.value / 100;

	    // 回転クォータニオンの生成
	    q.rotate(rad, [1.0, 0.0, 0.0], aQuaternion);
	    q.rotate(rad, [0.0, 1.0, 0.0], bQuaternion);
	    q.slerp(aQuaternion, bQuaternion, time, sQuaternion);

	    // モデルのレンダリング
	 //   draw(aQuaternion);
	 //   draw(bQuaternion);
	 //   draw(sQuaternion);

		 // プログラムオブジェクトの有効化(シェーダの選択)
		 gl.useProgram(prg);

			var torusnum = numRange.value;

			for(var i = 0; i < torusnum; i++){
				q.slerp(aQuaternion, bQuaternion, time * (i / torusnum), sQuaternion);
				drawOut(sQuaternion);
			//	drawSphere();
			}

			drawSphere();


			for(var i = 0; i < torusnum; i++){
				q.slerp(aQuaternion, bQuaternion, time * (i / torusnum), sQuaternion);
				draw(sQuaternion);

			}


			function drawOut(qtn){
				// ステンシルテストを有効にする
					gl.enable(gl.STENCIL_TEST);

					// カラーと深度をマスク
					gl.colorMask(false, false, false, false);
					gl.depthMask(false);

					// トーラス(シルエット)用ステンシル設定
					gl.stencilFunc(gl.ALWAYS, 1, ~0);
					gl.stencilOp(gl.KEEP, gl.REPLACE, gl.REPLACE);

					// トーラスのVBOとIBOをセット
					set_attribute(tVBOList, attLocation, attStride);
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndex);

					var qMatrix = m.identity(m.create());
					// モデル座標変換行列の生成
					q.toMatIV(qtn, qMatrix);
					m.identity(mMatrix);
					m.multiply(mMatrix, qMatrix, mMatrix);
					q.toMatIV(qt, qMatrix);
					m.multiply(mMatrix, qMatrix, mMatrix);

					//	m.translate(mMatrix, [0.0, 0.0, -5.0], mMatrix);
					m.multiply(tmpMatrix, mMatrix, mvpMatrix);
					m.inverse(mMatrix, invMatrix);

					// uniform変数の登録と描画
					gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
					gl.uniformMatrix4fv(uniLocation[1], false, mMatrix);
					gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
					gl.uniform3fv(uniLocation[3], lightPosition);
					gl.uniform3fv(uniLocation[4], camPosition);
					gl.uniform4fv(uniLocation[5], ambientColor);
					gl.uniform1i(uniLocation[8], false);  // *テクスチャ   OFF
					gl.uniform1i(uniLocation[6], true); // *アウトライン ON
					gl.drawElements(gl.TRIANGLES, torusData.i.length, gl.UNSIGNED_SHORT, 0);
			}


			function draw(qtn){
					// カラーと深度のマスクを解除
					gl.colorMask(true, true, true, true);
					gl.depthMask(true);

					// ステンシルテストを無効にする
					gl.disable(gl.STENCIL_TEST);
					// トーラスのVBOとIBOをセット
					set_attribute(tVBOList, attLocation, attStride);
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndex);

					var qMatrix = m.identity(m.create());
	        // モデル座標変換行列の生成
	        q.toMatIV(qtn, qMatrix);
	        m.identity(mMatrix);
	        m.multiply(mMatrix, qMatrix, mMatrix);
					q.toMatIV(qt, qMatrix);
					m.multiply(mMatrix, qMatrix, mMatrix);

					//	m.translate(mMatrix, [0.0, 0.0, -5.0], mMatrix);
	        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
	        m.inverse(mMatrix, invMatrix);

	        // uniform変数の登録と描画
	        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
	        gl.uniformMatrix4fv(uniLocation[1], false, mMatrix);
	        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
	        gl.uniform3fv(uniLocation[3], lightPosition);
	        gl.uniform3fv(uniLocation[4], camPosition);
	        gl.uniform4fv(uniLocation[5], ambientColor);
					gl.uniform1i(uniLocation[8], false);  // *テクスチャ   OFF
					gl.uniform1i(uniLocation[6], false); // *アウトライン OFF
	        gl.drawElements(gl.TRIANGLES, torusData.i.length, gl.UNSIGNED_SHORT, 0);
	    }

			function drawSphere(){
					// カラーと深度のマスクを解除
					gl.colorMask(true, true, true, true);
					gl.depthMask(true);

					// 球体モデル用ステンシル設定
					gl.stencilFunc(gl.EQUAL, 0, ~0);
					gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

					// 球体モデルの頂点データ
					set_attribute(sVBOList, attLocation, attStride);
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sIndex);

					// 球体モデル座標変換行列の生成
					m.identity(mMatrix);
					m.scale(mMatrix, [10.0, 10.0, 10.0], mMatrix);
					m.multiply(tmpMatrix, mMatrix, mvpMatrix);

					// uniform変数の登録と描画
					gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
					gl.uniformMatrix4fv(uniLocation[1], false, mMatrix);
					gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
					gl.uniform3fv(uniLocation[3], lightPosition);
					gl.uniform3fv(uniLocation[4], camPosition);
					gl.uniform4fv(uniLocation[5], ambientColor);
					gl.uniform1i(uniLocation[7], 0);
					gl.uniform1i(uniLocation[8], true);  // *テクスチャ   ON
					gl.uniform1i(uniLocation[6], false); // *アウトライン OFF
					gl.drawElements(gl.TRIANGLES, sphereData.i.length, gl.UNSIGNED_SHORT, 0);
			}

  		// コンテキストの再描画
  		gl.flush();

  		// ループのために再帰呼び出し
  		setTimeout(arguments.callee, 1000 / 30);
  	})();

		function create_texture(source){
    // イメージオブジェクトの生成
    var img = new Image();

    // データのオンロードをトリガーにする
    img.onload = function(){
        // テクスチャオブジェクトの生成
        var tex = gl.createTexture();

        // テクスチャをバインドする
        gl.bindTexture(gl.TEXTURE_2D, tex);

        // テクスチャへイメージを適用
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

        // ミップマップを生成
        gl.generateMipmap(gl.TEXTURE_2D);

        // テクスチャのバインドを無効化
        gl.bindTexture(gl.TEXTURE_2D, null);

        // 生成したテクスチャをグローバル変数に代入
        texture = tex;
    };

    // イメージオブジェクトのソースを指定
    img.src = source;
}

  	// シェーダを生成する関数
  	function create_shader(id){
  		// シェーダを格納する変数
  		var shader;

  		// HTMLからscriptタグへの参照を取得
  		var scriptElement = document.getElementById(id);

  		// scriptタグが存在しない場合は抜ける
  		if(!scriptElement){return;}

  		// scriptタグのtype属性をチェック
  		switch(scriptElement.type){

  			// 頂点シェーダの場合
  			case 'x-shader/x-vertex':
  				shader = gl.createShader(gl.VERTEX_SHADER);
  				break;

  			// フラグメントシェーダの場合
  			case 'x-shader/x-fragment':
  				shader = gl.createShader(gl.FRAGMENT_SHADER);
  				break;
  			default :
  				return;
  		}

  		// 生成されたシェーダにソースを割り当てる
  		gl.shaderSource(shader, scriptElement.text);

  		// シェーダをコンパイルする
  		gl.compileShader(shader);

  		// シェーダが正しくコンパイルされたかチェック
  		if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){

  			// 成功していたらシェーダを返して終了
  			return shader;
  		}else{

  			// 失敗していたらエラーログをアラートする
  			alert(gl.getShaderInfoLog(shader));
  		}
  	}

  	// プログラムオブジェクトを生成しシェーダをリンクする関数
  	function create_program(vs, fs){
  		// プログラムオブジェクトの生成
  		var program = gl.createProgram();

  		// プログラムオブジェクトにシェーダを割り当てる
  		gl.attachShader(program, vs);
  		gl.attachShader(program, fs);

  		// シェーダをリンク
  		gl.linkProgram(program);

  		// シェーダのリンクが正しく行なわれたかチェック
  		if(gl.getProgramParameter(program, gl.LINK_STATUS)){

  			// 成功していたらプログラムオブジェクトを有効にする
  			gl.useProgram(program);

  			// プログラムオブジェクトを返して終了
  			return program;
  		}else{

  			// 失敗していたらエラーログをアラートする
  			alert(gl.getProgramInfoLog(program));
  		}
  	}

  	// VBOを生成する関数
  	function create_vbo(data){
  		// バッファオブジェクトの生成
  		var vbo = gl.createBuffer();

  		// バッファをバインドする
  		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

  		// バッファにデータをセット
  		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  		// バッファのバインドを無効化
  		gl.bindBuffer(gl.ARRAY_BUFFER, null);

  		// 生成した VBO を返して終了
  		return vbo;
  	}

  	// VBOをバインドし登録する関数
  	function set_attribute(vbo, attL, attS){
  		// 引数として受け取った配列を処理する
  		for(var i in vbo){
  			// バッファをバインドする
  			gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);

  			// attributeLocationを有効にする
  			gl.enableVertexAttribArray(attL[i]);

  			// attributeLocationを通知し登録する
  			gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
  		}
  	}

  	// IBOを生成する関数
  	function create_ibo(data){
  		// バッファオブジェクトの生成
  		var ibo = gl.createBuffer();

  		// バッファをバインドする
  		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

  		// バッファにデータをセット
  		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);

  		// バッファのバインドを無効化
  		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  		// 生成したIBOを返して終了
  		return ibo;
  	}

  	// トーラスを生成する関数
  	function torus(row, column, irad, orad, color){
  		var pos = new Array(), nor = new Array(),
  		    col = new Array(), idx = new Array();
  		for(var i = 0; i <= row; i++){
  			var r = Math.PI * 2 / row * i;
  			var rr = Math.cos(r);
  			var ry = Math.sin(r);
  			for(var ii = 0; ii <= column; ii++){
  				var tr = Math.PI * 2 / column * ii;
  				var tx = (rr * irad + orad) * Math.cos(tr);
  				var ty = ry * irad;
  				var tz = (rr * irad + orad) * Math.sin(tr);
  				var rx = rr * Math.cos(tr);
  				var rz = rr * Math.sin(tr);
  				if(color){
  					var tc = color;
  				}else{
  					tc = hsva(360 / column * ii, 1, 1, 1);
  				}
  				pos.push(tx, ty, tz);
  				nor.push(rx, ry, rz);
  				col.push(tc[0], tc[1], tc[2], tc[3]);
  			}
  		}
  		for(i = 0; i < row; i++){
  			for(ii = 0; ii < column; ii++){
  				r = (column + 1) * i + ii;
  				idx.push(r, r + column + 1, r + 1);
  				idx.push(r + column + 1, r + column + 2, r + 1);
  			}
  		}
  		return {p : pos, n : nor, c : col, i : idx};
  	}

  	// 球体を生成する関数
  /*	function sphere(row, column, rad, color){
  		var pos = new Array(), nor = new Array(),
  		    col = new Array(), idx = new Array();
  		for(var i = 0; i <= row; i++){
  			var r = Math.PI / row * i;
  			var ry = Math.cos(r);
  			var rr = Math.sin(r);
  			for(var ii = 0; ii <= column; ii++){
  				var tr = Math.PI * 2 / column * ii;
  				var tx = rr * rad * Math.cos(tr);
  				var ty = ry * rad;
  				var tz = rr * rad * Math.sin(tr);
  				var rx = rr * Math.cos(tr);
  				var rz = rr * Math.sin(tr);
  				if(color){
  					var tc = color;
  				}else{
  					tc = hsva(360 / row * i, 1, 1, 1);
  				}
  				pos.push(tx, ty, tz);
  				nor.push(rx, ry, rz);
  				col.push(tc[0], tc[1], tc[2], tc[3]);
  			}
  		}
  		r = 0;
  		for(i = 0; i < row; i++){
  			for(ii = 0; ii < column; ii++){
  				r = (column + 1) * i + ii;
  				idx.push(r, r + 1, r + column + 2);
  				idx.push(r, r + column + 2, r + column + 1);
  			}
  		}
  		return {p : pos, n : nor, c : col, i : idx};
  	}*/

  	// HSVカラー取得用関数
  	function hsva(h, s, v, a){
  		if(s > 1 || v > 1 || a > 1){return;}
  		var th = h % 360;
  		var i = Math.floor(th / 60);
  		var f = th / 60 - i;
  		var m = v * (1 - s);
  		var n = v * (1 - s * f);
  		var k = v * (1 - s * (1 - f));
  		var color = new Array();
  		if(!s > 0 && !s < 0){
  			color.push(v, v, v, a);
  		} else {
  			var r = new Array(v, n, m, m, k, v);
  			var g = new Array(k, v, v, n, m, m);
  			var b = new Array(m, m, k, v, v, n);
  			color.push(r[i], g[i], b[i], a);
  		}
  		return color;
  	}

				// フレームバッファをオブジェクトとして生成する関数
		function create_framebuffer(width, height){
		    // フレームバッファの生成
		    var frameBuffer = gl.createFramebuffer();

		    // フレームバッファをWebGLにバインド
		    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

		    // 深度バッファ用レンダーバッファの生成とバインド
		    var depthRenderBuffer = gl.createRenderbuffer();
		    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);

		    // レンダーバッファを深度バッファとして設定
		    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

		    // フレームバッファにレンダーバッファを関連付ける
		    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);

		    // フレームバッファ用テクスチャの生成
		    var fTexture = gl.createTexture();

		    // フレームバッファ用のテクスチャをバインド
		    gl.bindTexture(gl.TEXTURE_2D, fTexture);

		    // フレームバッファ用のテクスチャにカラー用のメモリ領域を確保
		    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		    // テクスチャパラメータ
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		    // フレームバッファにテクスチャを関連付ける
		    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);

		    // 各種オブジェクトのバインドを解除
		    gl.bindTexture(gl.TEXTURE_2D, null);
		    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		    // オブジェクトを返して終了
		    return {f : frameBuffer, d : depthRenderBuffer, t : fTexture};
		}

  };
