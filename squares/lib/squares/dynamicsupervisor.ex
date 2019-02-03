defmodule Squares.DynamicSupervisor do
  @moduledoc """
  Dynamic Supervisor module that creates children workers.
  """
  use DynamicSupervisor

  @doc """
  Default starting function for DynamicSupervisor.
  """
  def start_link(args) do
    DynamicSupervisor.start_link(__MODULE__, args, name: __MODULE__)
  end

  @doc """
  Recursively creates a given `num` of children for the DynSup.
  """
  def create_children(num, first \\ true) do

    current_children = DynamicSupervisor.which_children(Squares.DynamicSupervisor)

    # If `first` is true, then this is the first iteration of a new problem.
    # In this case, current children are no longer relvent and shoule be deleted.
    if first do
      terminate_children(current_children)
    end

    # Recursively create `num` children, and return a list of them all
    if num > 0 do
      child = %{
        id: String.to_atom("worker" <> Integer.to_string(num)),
        start: {Squares, :start_link, [[:begin]]}
      }

      DynamicSupervisor.start_child(__MODULE__, child)
      create_children(num - 1, false)
    else
      child_list DynamicSupervisor.which_children __MODULE__
    end

  end

  @doc """
  Creates single child worker of module Squares with an id using `number`.
  """
  def create_child(number) do
    child = %{
      id: String.to_atom("w" <> Integer.to_string(number)),
      start: {Squares, :start_link, [number]}
    }
    DynamicSupervisor.start_child(__MODULE__, child)
  end

  @doc """
  Terminates all of DynamicSupervisor's children. Necessary when
  starting a new problem.
  """
  def terminate_children(list) do
    if length(list) > 0 do
      {_id, pid, _type, _modules} = Enum.at(list, 0)
      DynamicSupervisor.terminate_child(__MODULE__, pid)
      Enum.drop(list, 1)
      |> terminate_children()
    else
      :ok
    end
  end

  @doc """
  Default init() function.
  """
  def init(_args) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end

  @doc """
  Reformats a list of children pids to be readable elsewhere in the system.
  """
  def child_list(children, return_list \\ []) do
    if length(children) > 0 do
      {_id, pid, _type, _modules} = Enum.at(children, 0)

      pid_str =
      inspect(pid)
      |> String.split(".")
      |> Enum.at(1)

      return_list = return_list ++ [pid_str]
      Enum.drop(children, 1)
      |> child_list(return_list)
    else
      return_list
    end
  end

end
