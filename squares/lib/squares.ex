defmodule Squares do
  @moduledoc """
  Worker node module.
  """
  use GenServer

  @doc """
  Worker begins with unique id: `name` and `arg` consisting of
  list of lists of numbers on which it will operate.
  """
  def start_link(starting_value) do
    GenServer.start_link(__MODULE__, starting_value)
  end

  @doc """
  Requests the state of a worker node given by `pid`.
  """
  def get_state(pid) do
    GenServer.call(pid, :get_state)
  end

  @doc """
  Sends amount, length, and number of workers to a worker.
  """
  def compute(pid, [n, k, num_workers]) do
    GenServer.call(pid, {:compute, [n, k, num_workers]})
  end

  @doc """
  Default init function for worker process.
  """
  def init(starting_value) do
    state = %{
      starting_value: starting_value
    }
    {:ok, state}
  end

  @doc """
  Returns the state of a worker node.
  """
  def handle_call(:get_state, _from, state) do
    {:reply, state, state}
  end

  @doc """
  Creates lists based on `n` and `k` values.
  Calls Math module to check for perfect squares.
  Returns the {base, square} pairs for which that is true.
  """
  def handle_call({:compute, [n, k, num_workers]}, _from, state) do

    # Make list of only those starting values (bases) on which this worker will operate
    first_values =
    Enum.to_list(state.starting_value..n)
    |> Enum.take_every(num_workers)

    # Create list those values whose incremental series compute to a square
    squares =
    Enum.map(
      first_values,
      fn x ->
        square = Math.sum_of_squares(x, k)
        if square |> Math.is_perfect_square do
          {x, square}
        end
      end
    )
    |> Enum.filter(& !is_nil(&1))

    {:reply, squares, state}
  end

end
