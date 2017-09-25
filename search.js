
$('#search_btn').click(highlight);//点击search时，执行highlight函数；
	$('#search').keydown(function (e) {
		var key = e.which;
		if (key == 13) highlight();
	})

	var m = 0;
	var sCurText = "";
	function highlight() {
		var flag = false;//是否找到的标记，为false表示没有找到
		$('#tip').text('');
		$('#tip').hide();
		var searchText = $.trim($('#search').val());//查询字符串
		var originSearchTxt = searchText;
		searchText = unhtml(searchText);
		var _searchTop = $('#search').offset().top;
		var _searchLeft = $('#search').offset().left;

		//输入框输错之后的提示定位
		var _showPopTop = _searchTop + 30;

		//对查询字符串进行转义
		searchText = searchText.replace(/[\*\.\?\+\$\^\[\]\(\)\'\"\{\}\|\/]\\/g, function (e) { return "\\" + e });
		var regExp = new RegExp(searchText, 'gi');
		var content = unhtml($(".wrap p").text());
		if (originSearchTxt == "") {
			showTips("请输入要查找的内容", _showPopTop, 3, _searchLeft);
			return;
		}
		if (!regExp.test(content)) {
			showTips("没有找到要查找的内容", _showPopTop, 3, _searchLeft);
			return;
		}
		if (sCurText != originSearchTxt) {//当 当前字符串的值和之前的字符串匹配不上时，把m置为0
			clearSelection();//先清空一下上次高亮显示的内容；
			sCurText = originSearchTxt;
			m = 0;
			flag = true;
			//遍历
			$('.wrap p').each(function () {
				var html = $(this).html();
				var newHtml = "";
				var htmlArr = [];
				//var regExp2 = new RegExp("[\<]{1}[^(\<|\>)]+" +"\{\{\{\{"+ searchText +"\}\}\}\}"+ "[^\<]+?[\>]{1}", "gi");
				if (html.indexOf(originSearchTxt) != -1) {//该段落有要查找的字符串
					html = html.replace(/[\<]/g, function (x) { return "@@@<" })
					.replace(/[\>]/g, function (x) { return ">@@@" })
					htmlArr = html.split("@@@");
					var htmlArr1 = [];
					for (var l = 0, len = htmlArr.length; l < len; l++) {
						if (!/^[\<]/.test(htmlArr[l])) {//NOT TAG
							if (htmlArr[l] === "") {//过滤掉空的项
							} else {//非空的项
								htmlArr1.push(htmlArr[l].replace(regExp, function (e) {
									return '<span class="highlight">' + e + '</span>';
								}));
							}
						} else {//tag
							htmlArr1.push(htmlArr[l]);
						}
					}


					newHtml = htmlParse(htmlArr1.join(''));

					$(this).html(newHtml);//更新；
					
				}
			});
		} else {
			flag = true;
		}
		if (flag == true) {
			//找到了
			var _top = 0;
			//存下当前高亮标签的位置
			_top = $(".highlight").eq(m).offset().top + $(".highlight").eq(m).height();
			if (m > 0) {
				$(".highlight").eq(m - 1).css('background', '#c3d5e3');
			} else {
				$(".highlight").eq($(".highlight").size() - 1).css('background', '#c3d5e3');
			}
			$(".highlight").eq(m).css('background', 'pink');
			$(".highlight").css({"margin-right":0})
			//指定内容移动到指定位置
			$(".wrap").stop().animate({ scrollTop: _top - $(".wrap").offset().top + $(".wrap").scrollTop() - 150 });
			m++;
			if (m > $(".highlight").size() - 1) {
				m = 0;
			}
		} else {
			showTips("没有找到要查找的内容", _showPopTop, 3, _searchLeft);
			return;
		}
	}
	function clearSelection() {
		//遍历每一个P标签
		$('.wrap p').each(function () {
			//找到所有highlight属性的元素；
			$(this).find('.highlight').each(function () {
				$(this).replaceWith($(this).html());//将他们的属性去掉；
			});
		});
	}

	//mask
	var tipsDiv = '<div class="tipsClass"></div>';
	$('body').append(tipsDiv);
	function showTips(tips, height, time, left) {
		var windowWidth = document.documentElement.clientWidth;
		$('.tipsClass').text(tips);
		$('div.tipsClass').css({
			'top': height + 'px',
			'left': left + 'px',
			'position': 'absolute',
			'padding': '8px 6px',
			'background': '#000000',
			'font-size': 14 + 'px',
			'font-weight': 900,
			'margin': '0 auto',
			'text-align': 'center',
			'width': 'auto',
			'color': '#fff',
			'z-index': '999',
			'border-radius': '2px',
			'opacity': '0.8',
			'box-shadow': '0px 0px 10px #000'
		}).show();
		setTimeout(function () { $('div.tipsClass').fadeOut(); }, (time * 1000));
	}

	/**
     * 将str中的html符号转义,将转义“'，&，<，"，>”五个字符
     * @method unhtml
     * @param { String } str 需要转义的字符串
     * @return { String } 转义后的字符串
     * @example
     * ```javascript
     * var html = '<body>&</body>';
     *
     * //output: &lt;body&gt;&amp;&lt;/body&gt;
     * console.log( unhtml( html ) );
     *
     * ```
     */
function unhtml(str, reg) {
	return str ? str.replace(reg || /[&<">'](?:(amp|lt|quot|gt|#39|nbsp|#\d+);)?/g, function (a, b) {
		if (b) {
			return a;
		} else {
			return {
				'<':'&lt;',
				'&':'&amp;',
				'"':'&quot;',
				'>':'&gt;',
				"'":'&#39;'
			}[a]
		}
	}) : '';
}

/**
	* 将str中的转义字符还原成html字符
	* @see unhtml(String);
	* @method html
	* @param { String } str 需要逆转义的字符串
	* @return { String } 逆转义后的字符串
	* @example
	* ```javascript
	*
	* var str = '&lt;body&gt;&amp;&lt;/body&gt;';
	*
	* //output: <body>&</body>
	* console.log( html( str ) );
	*
	* ```
	*/
function htmlParse(str) {
	return str ? str.replace(/&((g|l|quo)t|amp|#39|nbsp);/g, function (m) {
		return {
			'&lt;':'<',
			'&amp;':'&',
			'&quot;':'"',
			'&gt;':'>',
			'&#39;':"'",
			'&nbsp;':' '
		}[m]
	}) : '';
}