"use client";

import styles from "./styles.module.css";

import { FETCH_BOARDS } from "@/components/boardQueries";

import { useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { FixedSizeList as List } from "react-window";

export default function BoardsPage() {
  const [hasMore, setHasMore] = useState(true);
  const { data, refetch, fetchMore } = useQuery(FETCH_BOARDS);
  const router = useRouter();

  // const { data, } = useQuery(FETCH_BOARDS);
  console.log(data?.fetchBoards);

  // const [hoveredId, setHoveredId] = useState();

  console.log("boards페이지에서 data.fetchBoards:", data?.fetchBoards);

  const onClickDetail = async (
    event: React.MouseEvent<HTMLDivElement>,
    id: string
  ) => {
    event.stopPropagation();
    router.push(`/boards/${id}`);
  };

  const onNext = () => {
    if (data === undefined) return;

    fetchMore({
      variables: {
        mypage: Math.ceil((data?.fetchBoards.length ?? 10) / 10) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.fetchBoards?.length) {
          setHasMore(false);
          return;
        }

        return {
          fetchBoards: [...prev.fetchBoards, ...fetchMoreResult.fetchBoards],
        };
      },
    });
  };

  return (
    <div className={styles.board_list}>
      <InfiniteScroll
        next={onNext}
        hasMore={hasMore}
        loader={<></>}
        dataLength={data?.fetchBoards.length ?? 0}
        scrollableTarget="스크롤대상ID" //<List /> 컴포넌트에 id를 스크롤대상id로 바꾸기
      >
        <List
          height={600}
          width={"100%"}
          itemSize={100} //몇 개?
          itemCount={data?.fetchBoards.length} //length가 전체 개수
          itemData={data?.fetchBoards}
          outerElementType={전체를감싸는태그}
        >
          {/* <div className={styles.list_box}>
        {data?.fetchBoards.map((el) => (
          <div
            key={el._id}
            className={styles.board_box}
            // onMouseEnter={() => setHoveredId(el._id)}
            // onMouseLeave={() => setHoveredId("")}
            onClick={(event) => onClickDetail(event, el._id)}
          >
            <div>{el.title}</div>

            <div>{el.createdAt.substring(0, 16).split("T")[0]}</div>
            <div>{el.createdAt.substring(0, 16).split("T")[1]}</div>
            
          </div>
        ))}
      </div> */}
          {({ index, style, data }) => (
            <div style={style}>
              <div
                className={styles.board_box}
                onClick={(event) => onClickDetail(event, data[index]._id)}
              >
                <div>{data[index].title}</div>
                <div>
                  {data[index].createdAt.substring(0, 16).split("T")[0]}
                </div>
                <div>
                  {data[index].createdAt.substring(0, 16).split("T")[1]}
                </div>
              </div>
            </div>
          )}
        </List>
      </InfiniteScroll>
    </div>
  );
}
const 전체를감싸는태그 = (props) => <div id="스크롤대상ID" {...props} />;
