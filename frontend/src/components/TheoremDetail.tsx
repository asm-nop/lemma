import { useParams } from "react-router-dom";

const TheoremDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>()

    return (<div>{slug}</div>);
};

export default TheoremDetail;
