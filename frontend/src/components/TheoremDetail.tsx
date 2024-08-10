import { useParams } from "react-router-dom";
import { useTheorems } from "../providers/TheoremProvider";

const TheoremDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    if (!slug) {
        throw new Error("Invalid theorem ID");
    }

    const theoremId = parseInt(slug, 10);

    const { theorems } = useTheorems();

    return (<div>{theoremId}</div>);
};

export default TheoremDetail;
