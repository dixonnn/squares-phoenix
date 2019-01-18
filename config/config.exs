# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# Configures the endpoint
config :squares_phoenix, SquaresPhoenixWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "O1Ha/P9yGOOwhg1Yr74xM4vKGtEcmDUXyGzMTmrwf9eD3RftdXdp5uD1D/Xo0wEn",
  render_errors: [view: SquaresPhoenixWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: SquaresPhoenix.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:user_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
