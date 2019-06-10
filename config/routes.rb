Rails.application.routes.draw do

  devise_for :users
  resources :designs do
    get 'interface' =>"jig#interface"
  end

  namespace :jig do
    get 'designer', :as => "designer"
    get 'generator', :as => "generator"
    get 'stl'
    get 'form', :as => "form"

  end
  get 'jig/interface/:id' => "jig#interface",  :as => "jig_interface"

  resources :user, :only => ["show"]


  get 'threejs/height_displacement', :as => "pic2stl"
  get 'threejs/environment', :as => "three_env"
  get 'threejs/plane_box', :as => "plane_box"
  get 'threejs/peg', :as => "peg_designer"
  get 'threejs/weaver', :as => "weaver"

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".
  # You can have the root of your site routed with "root"
  root 'application#home'
  
  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
