(function(window){
	var app = angular.module('flapperNews', ['ui.router']);

	app.config(function($stateProvider, $urlRouterProvider){
		$stateProvider
			.state('home',{
				url:'/home',
				templateUrl: '/home.html',
				controller: 'MainCtrl',
				controllerAs: 'main'
			})
			.state('posts',{
				url:'/posts/{id}',
				templateUrl: '/posts.html',
				controller: 'PostsCtrl',
				controllerAs: 'postsCtrl'
			});
		$urlRouterProvider.otherwise('home');
	})

	app.controller('MainCtrl', function(posts){
		var vm = this;
		vm.test = "Hello world!";
		vm.posts = posts.posts;
		vm.addPost = function(){
			if(!vm.title || vm.title === ''){ return; };
			vm.posts.push({
				title: vm.title, 
				link: vm.link,
				upvotes: 0,
				comments: [
					{author: 'Joe', body: 'Cool post!', upvotes: 0},
					{author: 'Bob', body: 'Great idea, but everything is wrong!', upvotes: 0},
				]
			});
			vm.title = "";
			vm.link = "";
		};
		vm.incrementUpvotes = function(post) {
			post.upvotes += 1;
		}
	});

	app.controller('PostsCtrl', function($stateParams, posts){
		var vm = this;
		vm.post = posts.posts[$stateParams.id];
		vm.test = posts.posts;
		
		vm.incrementUpvotes = function(comment) {
			comment.upvotes += 1;
		};

		vm.addComment = function(){
			if(vm.body === ""){ return;};
			vm.post.comments.push({
				body: vm.body,
				author: 'user',
				upvotes: 0
			});
			vm.body = '';
		}
	})

	app.factory('posts', function(){
		var o = {
			posts: []
		};
		return o;
	})
})(window);