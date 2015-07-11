(function(window){
	var app = angular.module('flapperNews', ['ui.router']);

	app.config(function($stateProvider, $urlRouterProvider){
		$stateProvider
			.state('home',{
				url:'/home',
				templateUrl: '/home.html',
				controller: 'MainCtrl',
				controllerAs: 'main',
				resolve: { postPromise: function(posts){
					return posts.getAll();
				}}
			})
			.state('posts',{
				url:'/posts/{id}',
				templateUrl: '/posts.html',
				controller: 'PostsCtrl',
				controllerAs: 'postsCtrl',
				resolve: { post: function($stateParams, posts){
					return posts.get($stateParams.id);
				}}
			});
		$urlRouterProvider.otherwise('home');
	})

	app.controller('MainCtrl', function(posts){
		var vm = this;
		vm.test = "Hello world!";
		vm.posts = posts.posts;
		vm.addPost = function(){
			if(!vm.title || vm.title === ''){ return; };
			posts.create({
				title: vm.title,
				link: vm.link,
			});
			vm.title = "";
			vm.link = "";
		};
		vm.incrementUpvotes = function(post) {
			posts.upvote(post);
		}
	});

	app.controller('PostsCtrl', function(posts, post){
		var vm = this;
		vm.post = post;
		
		
		vm.incrementUpvotes = function(comment) {
			posts.upvoteComment(post,comment);
		};

		vm.addComment = function(){
			if(vm.body === ""){ return;};
			posts.addComment(post._id,{
				body: vm.body,
				author: 'user',
			}).success(function(comment){
				vm.post.comments.push(comment);
			})
			vm.body = '';
		}
	})

	app.factory('posts', function($http){
		var o = {
			posts: []
		};

		o.getAll = function(){
			return $http.get('/posts').success(function(data){
				angular.copy(data, o.posts);
			})
		};
		o.create = function(post){
			return $http.post('/posts',post).success(function(data){
				o.posts.push(data);
			});
		};
		o.upvote = function(post){
			return $http.put('/posts/' + post._id + '/upvote')
				.success(function(data){
					post.upvotes += 1;
				})
		};
		o.get = function(id){
			return $http.get('/posts/' + id).then(function(res){
				return res.data;
			})
		};
		o.addComment = function(id, comment){
			return $http.post('/posts/'+ id + '/comments', comment);
		};
		o.upvoteComment = function(post, comment){
			return $http.put('/posts/'+post._id+'/comments/'+comment._id+'/upvote')
				.success(function(data){
					comment.upvotes +=1;
				})
		}
		return o;
	})
})(window);