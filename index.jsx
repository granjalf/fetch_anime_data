//Custom Hooks 
const useDataApi = (initialUrl, initialData) => {
  
    
    const { useState, useEffect, useReducer } = React;
    const [url, setUrl] = useState(initialUrl);

    
    const [state, dispatch] = useReducer(dataFetchReducer, {
      isLoading: false,
      isError: false,
      data: initialData
    });
  
    useEffect(() => {
        console.log("Entra UseEffect");
        
        let didCancel = false;
        const fetchData = async () => {
          dispatch({ type: "FETCH_INIT" });
          
          try {
            const result = await axios(url);
            
            if (!didCancel) {
              dispatch({ type: "FETCH_SUCCESS", payload: result.data.data });
            }
          } catch (error) {
            if (!didCancel) {
              dispatch({ type: "FETCH_FAILURE" });
            }
          }
          
        };
        fetchData();
        return () => {
          didCancel = true;
        };
      }, [url]);
      
      return [state, setUrl];
};

//Helpers
const range = (start, end) => {
  return Array(end - start + 1).fill(0).map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
    const start = (pageNumber - 1) * pageSize;
    let page = items.slice(start, start + pageSize);
    return page;
}

const dataFetchReducer = (state, action) => {
    switch (action.type) {
      case "FETCH_INIT":
        return {
          ...state,
          isLoading: true,
          isError: false
        };
      case "FETCH_SUCCESS":
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: {hits: action.payload}
        };
      case "FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true
        };
      default:
        throw new Error();
    }
  };

//Components
function PaginationButtonGroup({ items, pageSize, onPageChange }){
    const { Button, ButtonGroup, Row, Col } = ReactBootstrap;
    console.log(["items",items]);
    
    if (items.length <= 1) return null;
    let num = Math.ceil(items.length / pageSize);
    let pages = range(1, num);
   
    return(
      <Row className="mt-4">
        <Col>
        <ButtonGroup>
            {pages.map(page=>(
                <Button key={page} onClick={onPageChange} variant="secondary">{page}</Button>
            ))}
        </ButtonGroup>
        </Col>
      </Row>
    );
}

function App(){
    const { useState } = React;
    const { Container ,Card, ListGroup, Image } = ReactBootstrap;
    const [query, setQuery] = useState("sakura");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    
    const [{ data, isLoading, isError }, doFetch] = useDataApi(
        "https://kitsu.io/api/edge/anime?filter[text]=" + query,
        {
          hits: []
        }
      );

    const handlePageChange = e => {
        setCurrentPage(Number(e.target.textContent));
      };

    let page = data.hits;
    
    if (page.length >= 1) {
        page = paginate(page, currentPage, pageSize);
        console.log(`currentPage: ${currentPage}`);
    }    
    
    return(
        <Container fluid>
            <Card className="mt-4">
                <Card.Header>Anime List</Card.Header>
                <Card.Body>
                    <Card.Title>List of Anime movies and series</Card.Title>
                    <Card.Text>This list will display all the animes from a External source.</Card.Text>
                    <form
                        onSubmit={event => {
                        doFetch(`https://kitsu.io/api/edge/anime?filter[text]=${query}`);
                        event.preventDefault();
                        }}
                      >
                        <input
                        type="text"
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        />
                        <button type="submit">Search</button>
                    </form>
                    {isError && <div>Something went wrong ...</div>}
                    {isLoading ? (
                      <div>Loading ...</div>
                    ) : (
                      <ListGroup className="mt-4">
                        {page.map(item => (
                          <ListGroup.Item key={item.id}>
                            <Image src={item.attributes.coverImage?.large} style={ {width : "50px",height:"50px", objectFit: "cover"} } className="mr-4 " roundedCircle />
                            <a href={"https://www.youtube.com/watch?v=" + item.attributes.youtubeVideoId} target="_blank">{item.attributes.canonicalTitle}</a>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                    <PaginationButtonGroup items={data.hits} pageSize={pageSize} onPageChange={handlePageChange}></PaginationButtonGroup>
                </Card.Body>
            </Card>
        </Container>
        );
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
