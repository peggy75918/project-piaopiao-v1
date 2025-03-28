import Topbar from '../components/Topbar'
import UnderConstruction from '../assets/建置中.png'
import styles from './suggestion.module.css'

function Suggestion(){
    return (
        <div>
          <Topbar />
          <div className={styles.suggestion_container}>
            <p style={{margin: "0px", marginBottom: "20px"}}>👻 建議箱功能將於第二階段完成後開放使用</p>
            <img src={UnderConstruction} className={styles.suggestion_img} alt="cloud" />
            <a 
                href="https://www.flaticon.com/free-icons/process" 
                title="process icons"
                className={styles.suggestion_alink}
            >
                Process icons created by Freepik - Flaticon
            </a>
          </div>
        </div>
    )
}

export default Suggestion