require 'cgi'
require 'json'
require 'qipowl'

module QipowlDemo
  class App < Padrino::Application
    register LessInitializer
    # use ActiveRecord::ConnectionAdapters::ConnectionManagement
    register Padrino::Rendering
    register Padrino::Mailer
    register Padrino::Helpers

    enable :sessions

    ##
    # Caching support.
    #
    # register Padrino::Cache
    # enable :caching
    #
    # You can customize caching store engines:
    #
    # set :cache, Padrino::Cache.new(:LRUHash) # Keeps cached values in memory
    # set :cache, Padrino::Cache.new(:Memcached) # Uses default server at localhost
    # set :cache, Padrino::Cache.new(:Memcached, '127.0.0.1:11211', :exception_retry_limit => 1)
    # set :cache, Padrino::Cache.new(:Memcached, :backend => memcached_or_dalli_instance)
    # set :cache, Padrino::Cache.new(:Redis) # Uses default server at localhost
    # set :cache, Padrino::Cache.new(:Redis, :host => '127.0.0.1', :port => 6379, :db => 0)
    # set :cache, Padrino::Cache.new(:Redis, :backend => redis_instance)
    # set :cache, Padrino::Cache.new(:Mongo) # Uses default server at localhost
    # set :cache, Padrino::Cache.new(:Mongo, :backend => mongo_client_instance)
    # set :cache, Padrino::Cache.new(:File, :dir => Padrino.root('tmp', app_name.to_s, 'cache')) # default choice
    #

    ##
    # Application configuration options.
    #
    # set :raise_errors, true       # Raise exceptions (will stop application) (default for test)
    # set :dump_errors, true        # Exception backtraces are written to STDERR (default for production/development)
    # set :show_exceptions, true    # Shows a stack trace in browser (default for development)
    # set :logging, true            # Logging in STDOUT for development and file for production (default only for development)
    # set :public_folder, 'foo/bar' # Location for static assets (default root/public)
    # set :reload, false            # Reload application files (default in development)
    # set :default_builder, 'foo'   # Set a custom form builder (default 'StandardFormBuilder')
    # set :locale_path, 'bar'       # Set path for I18n translations (default your_apps_root_path/locale)
    # disable :sessions             # Disabled sessions by default (enable if needed)
    # disable :flash                # Disables sinatra-flash (enabled by default if Sinatra::Flash is defined)
    # layout  :my_layout            # Layout can be in views/layouts/foo.ext or views/foo.ext (default :application)
    #

    ##
    # You can configure for a specified environment like:
    #
    #   configure :development do
    #     set :foo, :bar
    #     disable :asset_stamp # no asset timestamping for dev
    #   end
    #

  before do
    session[:typo] ||= Qipowl::Ruler.new_bowler "html"
#    raise session[:typo].class.constants.map(&:to_s).join(' ')
    session[:mapping] ||= session[:typo].class::ENTITIES.rmerge({:custom => session[:typo].class::CUSTOM_TAGS}).to_json
  end
  
  get "/" do
    render 'static/root'
  end

  get :html, :map => '/html' do
    render 'static/html'
  end

  get :tutorial, :map => '/tutorial' do
    render :haml, "%p This is a tutorial"
  end

  get '/html/mapping' do
    content_type :json
    session[:mapping]
  end
  
  delete '/html/mapping/:key' do |key|
    content_type :json
    session[:typo].remove_entity(key.to_sym).to_json
  end
  
  put '/html/mapping/:section/:key/:value/?:enclosure?' do |section, key, value, enclosure|
    content_type :json
    session[:typo].add_entity(section.to_sym, key.to_sym, value.to_sym, enclosure ? enclosure.to_sym : nil).to_json
  end
  
  get '/html/parse' do
    str = CGI::parse(request.query_string)['text'].first
    content_type :html
    session[:typo].execute str
  end

    ##
    # You can manage errors like:
    #
    #   error 404 do
    #     render 'errors/404'
    #   end
    #
    #   error 505 do
    #     render 'errors/505'
    #   end
    #
  end
end
