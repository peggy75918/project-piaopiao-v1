import Topbar from '../components/Topbar'
import Switcher from '../components/Switcher'
import Taskcard from '../components/Taskcard'
import { PlusOutlined } from "@ant-design/icons"

function Tasklist(){
    
    return (
        <div>
            <Topbar />
            <Switcher />
            <Taskcard />
            <div className={{height: '60px',width: '60px', backgroundColor:'#153448', borderRadius: '50%', position: 'fixed', bottom: '31px', right: '31px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <PlusOutlined className={{fontSize: '32px', color: 'white'}} />
            </div>
        </div>
    )
}

export default Tasklist