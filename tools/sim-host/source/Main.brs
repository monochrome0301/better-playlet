' Simulator host: loads playlet-lib as a normal package instead of a component library,
' because brs-engine cannot resolve a library's pkg:/ and libpkg:/ paths.

function Main(args as object) as void
    screen = CreateObject("roSGScreen")
    port = CreateObject("roMessagePort")
    screen.setMessagePort(port)
    m.global = screen.getGlobalNode()

    scene = screen.CreateScene("SimHost")
    screen.show()
    scene.launchArgs = args

    input = CreateObject("roInput")
    input.setMessagePort(port)

    while true
        msg = wait(0, port)
        msgType = type(msg)
        if msgType = "roSGScreenEvent"
            if msg.isScreenClosed()
                return
            end if
        else if msgType = "roSGNodeEvent"
            if msg.getField() = "exitChannel" and msg.getData() = true
                return
            end if
        else if msgType = "roInputEvent"
            scene.inputArgs = msg.getInfo()
        end if
    end while
end function
