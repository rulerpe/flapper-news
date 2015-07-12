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
			})
			.state('login',{
				url:'/login',
				templateUrl: '/login.html',
				controller: 'AuthCtrl',
				controllerAs: 'log',
				onEnter: function($state, auth){
					if(auth.isLoggedIn()){
						$state.go('home');
					}
				}
			})
			.state('register',{
				url:'/register',
				templateUrl: '/register.html',
				controller: 'AuthCtrl',
				controllerAs: 'reg',
				onEnter: function($state, auth){
					if(auth.isLoggedIn()){
						$state.go('home');
					}
				}
			})
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
	});

	app.controller('AuthCtrl', function($state, auth){
		var vm = this;
		vm.user = {};

		vm.register = function(){
			auth.register(vm.user).error(function(error){
				vm.error = error;
			}).then(function(){
				$state.go('home');
			});
		};

		vm.logIn = function(){
			auth.logIn(vm.user).error(function(error){
				vm.error = error;
			}).then(function(){
				$state.go('home');
			});
		};
	});

	app.controller('NavCtrl', function(auth){
		var vm = this;
		vm.test = "hello";
		vm.isLoggedIn = auth.isLoggedIn;
		vm.currentUser = auth.currentUser;
		vm.logOut = auth.logOut;
	});

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

	app.factory('auth', function($http, $window){
		var auth = {};

		auth.saveToken = function(token){
			$window.localStorage['flapper-news-token'] = token;
		};
		auth.getToken = function(){
			return $window.localStorage['flapper-news-token'];
		};
		auth.isLoggedIn = function(){
			var token = auth.getToken();

			if(token){
				var payload = JSON.parse($window.atob(token.split('.')[1]));
				return payload.exp > Date.now()/ 1000;
			}else{
				return false
			}
		};
		auth.currentUser = function(){
			if(auth.isLoggedIn()){
				var token = auth.getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				return payload.username;
			}
		};
		auth.register = function(user){
			return $http.post('/register', user).success(function(data){
				auth.saveToken(data.token);
			})
		};
		auth.logIn = function(user){
			return $http.post('/login', user).success(function(data){
				auth.saveToken(data.token);
			});
		};
		auth.logOut = function(){
			$window.localStorage.removeItem('flapper-news-token');
		}
		return auth;
	})

})(window);