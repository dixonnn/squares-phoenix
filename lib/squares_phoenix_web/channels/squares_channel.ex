defmodule SquaresPhoenixWeb.SquaresChannel do
  use Phoenix.Channel

  def join("squares:lobby", _message, socket) do
    {:ok, socket}
  end

  def join("squares:" <> _private_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("execute", %{"N" => n, "k" => k}, socket) do

    # Terminate all current workers to create a new set
    DynamicSupervisor.which_children(Squares.Parent)
    |> Squares.Parent.terminate_children()

    n = String.to_integer n
    k = String.to_integer k

    # Times: array of times
    # results: array of pairs {base, sumofsquares}
    {times, results} = loop([n, k], 0, [], [], [])
    # IO.inspect results
    {bases, squares} = Enum.unzip(results)

    # Times should be of length n
    broadcast!(socket, "return", %{
      times: times,
      bases: bases,
      squares: squares
    })
    {:noreply, socket}
  end

  @doc """
  Initial call would be loop([N, k], 0, [], [], [])
  """
  def loop([n, k], count, pids, times, results) do
    if count < n do

      # Create new worker and append its pid to `pids`
      {:ok, pid} = Squares.Parent.create_child(count)
      pids = pids ++ [pid]

      # Time how long it takes to call server
      {new_time, new_results} =
      :timer.tc(
        fn inner_pids, inner_n, inner_k ->
          loop_helper(inner_pids, inner_n, inner_k)
        end,
        [pids, n, k]
      )

      # Append new time to `times`
      times = times ++ [Kernel./(new_time, 1_000)]
      # IO.inspect new_time
      # IO.inspect new_results

      # Set `results` to first return, then never change again
      results =
        if count == 0 do
          Enum.at(new_results, 0)
        else
          results
        end

      # if count == 0 do
      #   IO.inspect results
      # end

      # Call recursively
      loop([n, k], count + 1, pids, times, results)
    else
      {times, results}
    end
  end

  @doc """

  """
  def loop_helper(pids, n, k) do
    Enum.map(
      pids,
      fn worker ->
        Squares.compute(worker, [n, k, length(pids)])
      end
    )
  end

end
