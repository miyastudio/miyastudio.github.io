var App = angular.module('App', ['ngMaterial', 'ngMessages']);

//用于注入的 todo_list
var inject_list = function () {
    return [];
};

//注入的操作类
var inject_action = function (factory_list) {
    return {
        //添加操作
        add: function (todo) {
            //添加一个克隆的对象
            var new_todo = JSON.parse(JSON.stringify(todo));
            //添加以后，把添加标题的输入框设置为空
            todo.title = '';
            //注入的list添加刚才克隆的对象
            factory_list.push(new_todo);
            //保存到本地存储
            this.up();
        },
        //删除操作
        del: function (todo) {
            //遍历 list
            factory_list.map(function (_todo, index) {
                if (todo === _todo) {
                    //如果有传过来的对象，就删掉
                    factory_list.splice(index, 1);
                }
            });
            //然后保存到本地存储
            this.up();
        },
        //保存到本地存储
        up: function () {
            //克隆一个新的对象
            var save_obj = JSON.parse(JSON.stringify(factory_list));
            //遍历删除 hashKey、object 等 Angular 特有的字段
            save_obj.map(function (obj) {
                delete obj.$$hashKey;
                delete obj.object;
            });
            //保存到本地存储
            localStorage.setItem('list', JSON.stringify(save_obj));
        },
        //从本地存储中得到 todo_list
        load: function () {
            //转化成json
            var list = JSON.parse(localStorage.getItem('list'));
            //容错处理
            if (list === null) {
                list = [];
            }
            //返回
            return list;
        },
        //得到列表
        get: function () {
            console.log('getting from localStorage');
            //获取本地存储里的json
            var list = this.load();
            //初始化
            this.init();
            //遍历加入本地存储里的对象
            list.map(function (todo) {
                factory_list.push(todo);
            });
        },
        //初始化
        init: function () {
            //删除list里的一切
            factory_list.splice(0, factory_list.length);
        },
        //过滤
        filter: function (filter_value) {
            var _self = this;
            var list = this.load();
            //初始化
            this.init();
            //遍历加入本地存储里的对象
            function push_to_list(k) {
                list.map(function (todo) {
                    if (todo.status === k) {
                        factory_list.push(todo);
                    }
                });
            }
            switch (filter_value) {
                case 'r':
                    push_to_list('r');
                    break;
                case 'd':
                    push_to_list('d');
                    break;
                case 'f':
                    push_to_list('f');
                    break;
                default:
                    _self.get();
                    break;
            }
        },
        //搜索
        search: function (key) {
            console.log('search', key);
            var list = this.load();
            if (key) {
                console.log(key.length);
                //初始化
                this.init();
                //遍历差找是否有该key
                list.map(function (todo) {
                    if (todo.title.includes(key)) {
                        //有就加入
                        factory_list.push(todo);
                    }
                });
            } else {
                //如果搜索关键字都删掉了，就重新获取全部列表。
                this.get();
            }
        }
    }
}

var inject_options = function () {
    return [
        {
            title: '计划',
            value: 'r' //ready
        },
        {
            title: '正在',
            value: 'd'  //doing
        },
        {
            title: '完成',
            value: 'f'  //finish
        }
    ]
}
App.factory('factory_options', inject_options);

App.factory('factory_list', inject_list);
App.factory('factory_action', inject_action);

function controller_list($scope, factory_list, factory_action) {
    factory_action.get();
    $scope.list = factory_list;

}

function controller_add($scope, $mdDialog, factory_action) {
    $scope.todo = {
        title: '',
        status: 'r'
    }
    var self = this;
    /*
    self.openDialog = function ($event) {
        $mdDialog.show({
            controller: DialogCtrl,
            controllerAs: 'ctrl',
            templateUrl: 'dialog.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: true
        })
    }
    */
    
    $scope.open_dialog = function (ev) {
        function DialogController($scope, $mdDialog) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.answer = function (answer) {
                $mdDialog.hide(answer);

            };
        }
        $mdDialog.show({
            skipHide: true,
            controller: DialogController,
            templateUrl: 'add.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            scope: $scope,
            preserveScope: true,
            clickOutsideToClose: true
        });
    }
    $scope.add = function () {
        factory_action.add($scope.todo);
    }
}

function controller_edit($scope, factory_action, factory_options) {
    $scope.options = factory_options;
    $scope.show = {
        title: true,
        edit: false
    };
    $scope.edit = function () {
        console.log('edit')
        $scope.show.edit = true;
        $scope.show.title = false;
    }
    $scope.del = function (todo) {
        factory_action.del(todo);
    }
    $scope.ok = function () {
        $scope.show.edit = false;
        $scope.show.title = true;
        factory_action.up();
    }
}

function controller_search($scope, factory_action) {

}

function controller_filter($scope, factory_options, factory_action) {
    $scope.options = factory_options;
    $scope.filter = 'a';//all
    $scope.$watch('filter', function (new_value, old_value) {
        console.log(new_value);
        factory_action.filter(new_value);
    });
    $scope.$watch('key', function (new_value, old_value) {
        $scope.filter = 'a';
        factory_action.search(new_value);
    });
}
//set 
App.controller('list', controller_list);
App.controller('add', controller_add);
App.controller('edit', controller_edit);
App.controller('filter', controller_filter);