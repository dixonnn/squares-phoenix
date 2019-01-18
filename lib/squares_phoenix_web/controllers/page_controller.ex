defmodule SquaresPhoenixWeb.PageController do
  use SquaresPhoenixWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
