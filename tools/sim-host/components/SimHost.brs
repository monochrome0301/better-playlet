' Simulator host: runs playlet-lib as a normal package (the engine can't load it as a
' component library).

function Init()
    m.top.backgroundColor = "#242424FF"
    m.top.backgroundURI = ""
    m.global.addFields({ loadingIndicator: m.top.findNode("LoadingIndicator") })
    m.global.addField("AutoBindNodes", "nodearray", false)

    container = m.top.findNode("MainSceneContainer")
    container.createChild("MainScene")
    container.change = { field: "children" }

    m.bindTimer = CreateObject("roSGNode", "Timer")
    m.bindTimer.duration = 0.25
    m.bindTimer.repeat = true
    m.bindTimer.observeField("fire", "BindPendingNodes")
    m.bindTimer.control = "start"
end function

' Same three passes as the lib's AutoBindSceneGraph, for nodes registered since the last tick
function BindPendingNodes()
    nodes = m.global.AutoBindNodes
    if nodes = invalid or nodes.Count() = 0
        return
    end if
    m.global.AutoBindNodes = []
    for each node in nodes
        node.callfunc("BindNodeFieldsAndProps", invalid)
    end for
    for each node in nodes
        node.callfunc("BindScopeFields", invalid)
    end for
    for each node in nodes
        node.binding_done = true
    end for
end function
