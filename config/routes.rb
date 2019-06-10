Rails.application.routes.draw do

  get 'interface' =>"jig#interface"
  get 'stl' =>"jig#stl"

  get 'threejs/height_displacement', :as => "pic2stl"
  get 'threejs/environment', :as => "three_env"
  get 'threejs/plane_box', :as => "plane_box"
  get 'threejs/peg', :as => "peg_designer"
  get 'threejs/weaver', :as => "weaver"

  root 'application#home'
  end
