Rails.application.routes.draw do
  get 'tool' =>"jig#interface", :as => "tool"
  get 'stl' =>"jig#stl", :as => "stl"

  root 'application#home'
  end
