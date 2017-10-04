(function (){
	'use strict';

	var $form_add_task =$('.add-task'),
		$task_delete_trigger,
		$task_detail,
		$task_detail_trigger,
		$task_detail = $('.task-detail'),
		$task_detail_mask = $('.task-detail-mask'),
		current_index,
		$update_form,
		$task_detail_content,
		$task_detail_content_input,
		$checkbox_complete,
		task_list = [];

		init();

	$form_add_task.on('submit',on_add_task_form_submit);
	$task_detail_mask.on('click',hide_task_detail);

	function on_add_task_form_submit(e){
			var new_task = {},$input;
			// 阻止默认事件
			e.preventDefault();
			// 获取新的task值
			$input = $(this).find('input[name=content]')
			new_task.content = $input.val();
			/*判断是否为空，若为空返回，否则继续执行*/
			if(!new_task.content) return;
			/*执行函数，将新值添加进localstorage*/
			if(add_task(new_task)){
				$input.val(null);
			}

		}



	/*监听所有的task详细按钮事件*/

	function listen_task_detail() {
		var index ;

		$('.task-item').on('dblclick', function(){
			index = $(this).data('index');
			show_task_detail(index);
		})

		$task_detail_trigger.on('click',function(){
			var $this = $(this);
			var $item = $this.parent().parent();
			index = $item.data('index');
			show_task_detail(index);
		})
	}

	function listen_checkbox_complete () {
		$checkbox_complete.on('click',function(){
			var $this = $(this);
			var index = $this.parent().parent().data('index');

			var item =get(index);



			if(item.complete) {
				update_task(index,{complete:false});
			}
			else{
				update_task(index,{complete:true});
			}
		})
	}

	function get(index) {
		return store.get('task_list')[index];
	}

	/* 查看task详情 */
	function show_task_detail(index) {
		render_task_detail(index);
		current_index = index;
		$task_detail.show();
		$task_detail_mask.show();
	}

	function update_task(index, data) {
		if(!index || !task_list[index])
			return;
		task_list[index] = $.extend({},task_list[index],data);
		refresh_task_list();
	}

	function hide_task_detail() {
		$task_detail.hide();
		$task_detail_mask.hide();
	}

	/*渲染指定的task的详细模板*/
	function render_task_detail(index) {

		if( index === undefined || !task_list[index])
			return;
		var item = task_list[index];
		var tpl =
		'<form>'+
			'<div class="content">'+
				item.content+
			'</div>'+
			'<div class="input_item">'+
			'<input id="one" style="display:none" type="text" name="content" value="'+(item.content || '')+'">'+
			'</div>'+
			'<div class="input_item">'+
				'<div class="desc">'+
					'<textarea name="desc">'+(item.desc || '')+'</textarea>'+
				'</div>'+
			'</div>'+
			'<div class="remind input_item">'+
				'<input class="datatimes" name="remind_date" type="text" value="'+(item.remind_date || '')+'">'+
			'</div>'+
			'<div class="input_item"><button type="submit">更新</button></div>'+
		'</form>';

		/**/
		$task_detail.html("");
		$task_detail.html(tpl);
		$('.datatimes').datetimepicker();

		$update_form = $task_detail.find('form');
		$task_detail_content = $update_form.find('.content');
		$task_detail_content_input = $update_form.find('[name=content]');

		$task_detail_content.on('dblclick',function() {
			$task_detail_content_input.show();
			$task_detail_content.hide();
		})


		$update_form.on('submit',function(e) {
			e.preventDefault();

			var data = {};
			data.content= $(this).find('[name=content]').val();
			data.desc= $(this).find('[name=desc]').val();
			data.remind_date= $(this).find('[name=remind_date]').val();
			update_task(index,data);

			hide_task_detail();

		})
	}

	/*查找并监听全部的task删除按钮事件*/
	function listen_task_delete() {
		$task_delete_trigger.on('click',function(){
			var $this = $(this);
			/*查找删除按钮所在的task*/
			var $item = $this.parent().parent();
			var index = $item.data('index');
			/*确认删除？*/
			var tmp = confirm("确定删除?");
			tmp ? delete_task(index) : null;
		})
	}



	function add_task(new_task) {
		/*将新值添加到列表*/
		task_list.push(new_task);
		/*将新列表更新到localstorage中*/
		refresh_task_list ();

		return true;
	}

	/*刷新模板数据*/
	function refresh_task_list () {
		store.set('task_list',task_list);
		render_task_list();
	}

	/*删除task*/

	function delete_task(index) {
		if(index == undefined || !task_list[index]) return;

		delete task_list[index];
		/*删除task后刷新模板数据*/
		refresh_task_list ();
	}

	function init(){
		task_list = store.get('task_list') || [];
		if(task_list.length)
		 	render_task_list();

	}

	/*渲染全部的模板*/
	function render_task_list() {
		var $task_list = $('.task-list');
		$task_list.html("");
		var complete_items = [];
		for(var i = 0; i < task_list.length; i++){
			var tmp = task_list[i];
			if(tmp && tmp.complete){
				complete_items[i] = tmp;
			}
			else
				var $task = render_task_item(tmp,i);
			$task_list.prepend($task);
		}

		for( var j = 0; j < complete_items.length; j++) {
			var print_complete = render_task_item(complete_items[j],j);
			$task_list.append(print_complete);
		}

		var $find_task = $('input[type=checkbox]');
		for(var n = 0; n < $find_task.length; n++) {
			if($find_task[n].checked){
				$find_task[n].parentNode.parentNode.setAttribute('class',' task-item completed');
			}
		}


		$task_delete_trigger = $('.action.delete');
		$task_detail_trigger = $('.action.detail');
		$checkbox_complete = $('.task-list .complete[type="checkbox"]');
		listen_task_delete();
		listen_task_detail();
		listen_checkbox_complete();
	}

	/* 渲染单个模板 */
	function render_task_item(data,index) {
		if(!data || !index) return;
		var task_item_tpl =
			'<div class="task-item" data-index="'+index+'">'+
				'<span><input class="complete" '+(data.complete ? 'checked' : "")+' type="checkbox"></span>'+
				'<span class="task-content">'+ data.content +'</span>'+
				'<span class="fr">'+
				'<span class="action delete"> 删除</span>'+
				'<span class="action detail"> 详细</span>'+
				'</span>'+
			'</div>';

		return $(task_item_tpl);

	}


})();

