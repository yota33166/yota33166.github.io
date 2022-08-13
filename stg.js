//WWS.jsに用意された、起動時1回だけ実行される関数
function setup(){
    canvasSize(1200, 720);
    loadImg(0, "image/bg.png");
    loadImg(1, "image/spaceship.png");
    loadImg(2, "image/missile.png");
    loadImg(3, "image/explode.png");
    loadSound(0, "sound/bgm.m4a");
    for(var i=0; i<=4; i++) loadImg(4+i, "image/enemy"+i+".png");
    for(var i=0; i<=2; i++) loadImg(9+i, "image/item"+i+".png");
    loadImg(12, "image/laser.png");
    loadImg(13, "image/title_ss.png");
    initSShip();
    initMissile();
    initObject();
}


//WWS.jsに用意された、マイフレーム実行される関数
function mainloop(){
    timer++;
    drawBG(1*(1+stage*0.1));
    switch(idx){
        case 0://タイトル画面
        drawImg(13, 200, 200);
        if(timer%40 < 20)fText("Press [SPACE] or Click to start", 600, 540, 40, "cyan");
        if(key[32]>0 || tapC>0){
            initSShip();
            initObject();
            score = 0;
            stage = 1;
            idx = 1;
            tmr = 0;
            playBgm(0);
        }
        break;

        case 1://ゲーム中
        setEnemy();
        setItem();
        moveSShip();
        moveMissile();
        moveObject();
        drawEffect();        
        //体力表示
        for(i=0; i<10; i++) fRect(20+i*30, 660, 20, 40, "#8b0000");
        for(i=0; i<energy; i++) fRect(20+i*30, 660, 20, 40, colorRGB(160-16*i, 240-12*i, 24*i));

        if(timer < 30*4) fText("STAGE "+stage, 600, 300, 50, "cyan")
        if(30*114 < timer && timer < 30*118) fText("STAGE CLEAR", 600, 300, 50, "cyan");
        if(timer == 30*120){
            stage++;
            timer = 0;
        }
        break;

        case 2://ゲームオーバー
        if(timer < 30*2 && timer%5 == 1) setEffect(ssX+rnd(120)-60, ssY+rnd(80)-40, 9);
        moveMissile();
        moveObject();
        drawEffect();
        if(score>=hisco) hisco = score;
        fText("GAME OVER", 600, 300, 50, "red");
        if(timer > 30*5) idx = 0;
        break;
    }
    fText("SCORE "+score, 200, 50, 40, "white");
    fText("HISCORE "+hisco, 600, 50, 40, "yellow");
}

//背景
var bgX = 0;
function drawBG(spd){
    //bgXが1200になったら0に戻る
    bgX = (bgX + spd) % 1200;
    drawImg(0, -bgX, 0);
    drawImg(0, 1200-bgX, 0);
    var hy = 580;//地面の地平線のY座標
    var ofsx = bgX%40;//縦のラインを移動させるオフセット値
    lineW(2);
    for(var i=1; i<=30; i++) {//縦のライン
        var tx = i*40-ofsx;
        var bx = i*240-ofsx*6-3000;
        line(tx, hy, bx, 720, "silver");
    }
    for(var i=1; i<12; i++) {//横のライン
        lineW(1+int(i/3));
        line(0, hy, 1200, hy, "gray");
        hy = hy + i*2;
    }
}

//ゲームの進行を管理
var idx = 0;
var timer = 0;

var score = 0;
var hisco = 10000;
var stage = 0;

//自機の管理
var ssX = 0;
var ssY = 0;
var automa = 0;//弾の自動発射
var energy = 0;//エネルギー
var muteki = 0;//無敵状態
var weapon = 0;//一度に打てる弾数
var laser = 0;//レーザーの使用回数

function initSShip(){
    ssX = 400;
    ssY = 360;
    energy = 10;
    muteki = 0;
    weapon = 0;
    laser = 0
}

function moveSShip(){
    if((key[37] > 0 || key[65] > 0)&& ssX > 60) ssX -= 20; 
    if((key[39] > 0 || key[68] > 0)&& ssX < 1000) ssX += 20;
    if((key[38] > 0 || key[87] > 0)&& ssY > 40) ssY -= 20;
    if((key[40] > 0 || key[83] > 0)&& ssY < 680) ssY += 20;

    if(key[77] == 1){//Mキー
        key[77]++;
        automa = 1-automa;
    }

    if(automa == 0 && key[32] == 1) {
        key[32]++;
        setWeapon();
    }
    if(automa == 1 && timer%8 == 0) setWeapon();

    var col = "black";
    if(automa == 1) col = "white";
    fRect(900, 20, 280, 60, "#483d8b")
    fText("[M]:Auto Missile", 1040, 50, 36, col);
    
    //タップ操作
    if(tapC > 0){
        if(900<tapX && tapX<1180 && 20<tapY && tapY<80){
            tapC = 0;
            automa = 1-automa;
        }
        else{
            ssX += int((tapX-ssX)/6);
            ssY += int((tapY-ssY)/6);
        }
    }

    if(muteki%2 == 0) drawImgC(1, ssX,ssY);
    if(muteki > 0) muteki--;

}

//発射ミサイルの管理
var MSL_MAX = 100;
var mslX  = new Array(MSL_MAX);
var mslY  = new Array(MSL_MAX);
var mslXp = new Array(MSL_MAX);
var mslYp = new Array(MSL_MAX);
var mslF  = new Array(MSL_MAX);//弾が撃ち出された状態か管理する
var mslImg = new Array(MSL_MAX);
var mslNum = 0;

function initMissile(){
    for(var i=0; i<MSL_MAX; i++) mslF[i] = false;
    mslNum = 0;
}

function setMissile(x, y, xp, yp){
    mslX[mslNum] = x;
    mslY[mslNum] = y;
    mslXp[mslNum] = xp;
    mslYp[mslNum] = yp;
    mslF[mslNum] = true;
    mslImg[mslNum] = 2;//通常弾
    if(laser > 0){//レーザー
        laser--;
        mslImg[mslNum] = 12;
    }
    mslNum = (mslNum+1)%MSL_MAX;
}

function moveMissile(){
    for(var i=0; i<MSL_MAX; i++){
        if(mslF[i] == true){
            mslX[i] += mslXp[i];
            mslY[i] += mslYp[i];
            drawImgC(mslImg[i], mslX[i], mslY[i]);
            if(mslX[i] > 1200) mslF[i] = false;
        }
    }
}

//自弾の管理
function setWeapon(){
    var n = weapon;
    if(n > 8) n = 8;
    for(var i=0; i<=n; i++) 
        setMissile(ssX+40, ssY-n*6 + i*12, 40, int((i-n/2)*2));
}

//敵機と敵の弾の管理
var OBJ_MAX = 100;
var objType = new Array(OBJ_MAX);//0=敵の弾　1=敵機
var objImg = new Array(OBJ_MAX);
var objLife= new Array(OBJ_MAX);

var objX = new Array(OBJ_MAX);
var objY = new Array(OBJ_MAX);
var objXp = new Array(OBJ_MAX);
var objYp = new Array(OBJ_MAX);
var objF = new Array(OBJ_MAX);
var objNum = 0;

function initObject(){
    for(var i=0; i<OBJ_MAX; i++) objF[i] = false;
    objNum = 0;
}

function setObject(typ, png, x, y, xp, yp, life){
    objType[objNum] = typ;
    objImg[objNum] = png;
    objX[objNum] = x;
    objY[objNum] = y;
    objXp[objNum] = xp;
    objYp[objNum] = yp;
    objLife[objNum] = life;
    objF[objNum] = true;
    objNum = (objNum+1)%OBJ_MAX;
}

function moveObject(){
    for(var i=0; i<OBJ_MAX; i++) {
        if(objF[i] == true){
            objX[i] += objXp[i];
            objY[i] += objYp[i];
            //敵2の動き
            if(objImg[i] == 6) {
                if(objY[i] < 60) objYp[i] = 8;
                if(objY[i] > 660)objYp[i] = -8;
            }
            //敵3の動き
            if(objImg[i] == 7) {
                if(objXp[i] < 0) {
                    objXp[i] = int(objXp[i]*0.95);
                    if(objXp[i] == 0) {
                        setObject(0, 4, objX[i], objY[i], -20, 0, 0);
                        objXp[i] = 20;
                    }
                }
            }
            drawImgC(objImg[i], objX[i], objY[i]);//物体の表示
            if(objType[i] == 1 && rnd(100) < 3) 
                setObject(0, 4, objX[i], objY[i], -24, 0, 0);
            if(objX[i] < -20) objF[i] = false;

            //自機の弾とのヒットチェック
            if(objType[i] == 1){//敵機
                var r = 12 +(img[objImg[i]].width + img[objImg[i]].height)/4;//弾と敵機の距離 
                for(var n=0; n<MSL_MAX; n++){
                    if(mslF[n] == true){
                        if(getDis(objX[i], objY[i], mslX[n], mslY[n]) < r){
                            if(mslImg[n] == 2) mslF[n] = false;//通常弾であれば弾を消す
                            objLife[i]--;
                            if(objLife[i] == 0){
                                objF[i] = false;
                                setEffect(objX[i], objY[i], 9);
                                score += 100;
                            }
                            else{
                                setEffect(objX[i], objY[i], 3);
                            }

                        }
                    }
                }
            }
            //自機とのヒットチェック
            if(idx == 1){//ゲーム中
                var r = 30 +(img[objImg[i]].width + img[objImg[i]].height)/4;//自機と敵機の距離
                if(getDis(objX[i], objY[i], ssX, ssY) < r){
                    if(objType[i] <= 1 && muteki == 0){//敵の弾と敵機
                        setEffect(objX[i], objY[i], 3)
                        objF[i] = false;
                        energy--;
                        muteki = 30;
                        if(energy == 0){
                            idx = 2;
                            timer = 0;
                            stopBgm();
                        }
                    }
                    if(objType[i] == 2){//アイテム
                        objF[i] = false;
                        if(objImg[i] == 9 && energy < 10) energy++;
                        if(objImg[i] == 10) weapon++;
                        if(objImg[i] == 11) laser += 100;
                    }
                }
            }
        }
    }
}

function setEnemy(){
    var sec = int(timer/30);//経過秒数
    if( 4<= sec && sec < 10){
        if(timer%20 == 0)
            setObject(1, 5, 1300, 60+rnd(600), -16*(1+0.1*stage), 0, 1*stage);//敵機1
    }
    if(14<= sec && sec < 20){
        if(timer%20 == 0)
            setObject(1, 6, 1300, 60+rnd(600), -12*(1+0.1*stage), 8*(1+0.1*stage), 3*stage);//敵機2
    }
    if(24<= sec && sec < 30){
        if(timer%20 == 0)
            setObject(1, 7, 1300, 360+rnd(300), -48*(1+0.1*stage), -10, 5*stage);//敵機3
    }
    if(34<= sec && sec < 50){
        if(timer%60 == 0)
            setObject(1, 8, 1300, rnd(720-192), -6*(1+0.1*stage), 0, 0);//障害物
    }
    if(54<= sec && sec < 70){
        if(timer%20 == 0) {
            setObject(1, 5, 1300,  60+rnd(300), -16*(1+0.1*stage),  4, 1*stage);//敵機1
            setObject(1, 5, 1300, 360+rnd(300), -16*(1+0.1*stage), -4, 1*stage);//敵機1
        }
    }
    if(74<= sec && sec <90){
        if(timer%20 == 0) 
            setObject(1, 6, 1300, 60+rnd(600), -12*(1+0.1*stage), 8*(1+0.1*stage), 3*stage);//敵機2
        if(timer%45 == 0)
            setObject(1, 8, 1300, rnd(720-192), -8*(1+0.1*stage), 0, 0);//障害物
    }
    if(94<= sec && sec <110)
        if(timer%10 == 0)
            setObject(1, 5, 1300, 360, -24*(1+0.1*stage), rnd(11)-5, 1*stage);//敵機1
        if(timer%20 == 0)
            setObject(1, 7, 1300, rnd(300), -56*(1+0.1*stage), 4+rnd(12), 5*stage);//敵機3
}
//エフェクト（爆発）の管理
var EFCT_MAX = 100;
var efctX = new Array(EFCT_MAX);
var efctY = new Array(EFCT_MAX);
var efctN = new Array(EFCT_MAX);//エフェクト番号
var efctNum = 0;

function initEffect(){
    for(var i=0; i<EFCT_MAX; i++) efctN[i] = 0;
    efctNum = 0;
}

function setEffect(x, y, n){
    efctX[efctNum] = x;
    efctY[efctNum] = y;
    efctN[efctNum] = n;
    efctNum = (efctNum+1)%EFCT_MAX;
}

function drawEffect(){
    for(var i=0; i<EFCT_MAX; i++){
        if(efctN[i] > 0) {
            drawImgTS(3, (9-efctN[i])*128, 0, 128, 128,
            efctX[i]-64, efctY[i]-64, 128, 128);
            efctN[i]--;
        }
    }
}
//アイテム管理
function setItem(){
    if(timer%180 ==  0) setObject(2,  9, 1300, 60+rnd(600), -10, 0, 0);//energy
    if(timer%180 == 60) setObject(2, 10, 1300, 60+rnd(600), -10, 0, 0);//missile
    if(timer%180 == 90) setObject(2, 11, 1300, 60+rnd(600), -10, 0, 0);//laser
}
