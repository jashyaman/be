function navBarAggregation(username) {
return [
    {
      $match : {
        owner_name : username
      }
    },
    {
      $project: {
        projectid: {
          $toString: "$_id"
        },
        project_name: 1,
        owner_name: 1
      }
    },
    {
      $lookup: {
        from: "modules",
        localField: "projectid",
        foreignField: "parent",
        as: "modules"
      }
    },
    {
      $addFields: {
        moduleIds: {
          $map: {
            input: "$modules",
            as: "modules",
            in: {
              $toString: "$$modules._id"
            }
          },
          
        }
      }
    },
    {
      $lookup: {
        from: "submodules",
        localField: "moduleIds",
        foreignField: "parent",
        as: "submodules"
      }
    },
    {
      $addFields : {
        submoduleIds: {
          $map : {
            input : "$submodules",
            as : "submodules",
            in: {
              $toString: "$$submodules._id"
            }
          }
        }
      }
    },
    {
        $lookup: {
          from: "tasks",
          localField: "submoduleIds",
          foreignField: "parent",
          as: "tasks"
        }
    },
    {
        $addFields : {
            taskIds: {
            $map : {
                input : "$tasks",
                as : "tasks",
                in: {
                $toString: "$$tasks._id"
                }
            }
            }
        }
    },
    {
        $lookup: {
          from: "subtasks",
          localField: "taskIds",
          foreignField: "parent",
          as: "subtasks"
        }
    },
    {
        $project: {
            "modules.__v" : 0,
            "submodules.__v" : 0,
            "tasks.__v" : 0,
            "subtasks.__v" : 0,
            "subtasks.estimate" : 0,
            "subtasks.description" : 0,
            "subtasks.owner_name" : 0,
            "tasks.estimate" : 0,
            "tasks.description" : 0,
            "tasks.owner_name" : 0,
            "submodules.estimate" : 0,
            "submodules.description" : 0,
            "submodules.owner_name" : 0,
            "modules.estimate" : 0,
            "modules.description" : 0,
            "modules.owner_name" : 0
        }
    }   
  ];
}

  module.exports = navBarAggregation